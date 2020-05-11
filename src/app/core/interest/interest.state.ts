/**
 * Copyright 2020 Solenix Schweiz GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InterestStateModel } from './interest.state';
import { InterestService } from './interest.service';
import {
    LoadInterests,
    SelectInterest,
    FavoriseInterest,
    NextIndex,
    PreviousIndex,
    LoadCurrentIndexData,
    CacheIndexData
} from './interest.actions';
import { Interest } from './interest';
import {
    State,
    Action,
    StateContext,
    Selector,
    NgxsOnInit,
    Store
} from '@ngxs/store';
import { Storage } from '@ionic/storage';
import { remove, findIndex } from 'lodash';
import { EOIndex } from '../open-eo/eo-index';
import { OpenstreetmapLocation } from '../openstreetmap/openstreetmap-location';
import { OpenEOService } from '../open-eo/open-eo.service';
import { IndexData } from '../open-eo/index-data';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { rotatingClamp } from '../utils';
import { Platform } from '@ionic/angular';

export interface InterestStateModel {
    interests: Interest[];
    selected: Interest;
    currentIndexId: number;
    currentIndex: EOIndex;
    currentIndexData: IndexData;
    indexDataCache: Map<string, IndexData>;
}

@State<InterestStateModel>({
    name: 'interest',
    defaults: {
        interests: [],
        selected: null,
        currentIndexId: 0,
        currentIndex: null,
        currentIndexData: null,
        indexDataCache: new Map<string, IndexData>()
    }
})
export class InterestState implements NgxsOnInit {
    private static readonly STORAGE_KEY = 'interests';

    constructor(
        private storage: Storage,
        private service: InterestService,
        private openEOService: OpenEOService,
        private store: Store,
        private diagnostic: Diagnostic,
        private platform: Platform
    ) {}

    @Selector()
    public static getAll(state: InterestStateModel) {
        return state.interests;
    }

    @Selector()
    public static getFavorites(state: InterestStateModel) {
        return state.interests.filter((item: Interest) => item.isFavorite);
    }

    @Selector()
    public static getSelected(state: InterestStateModel) {
        return state.selected;
    }

    @Selector()
    public static getCurrentIndex(state: InterestStateModel) {
        return state.currentIndex;
    }

    @Selector()
    public static getCurrentIndexId(state: InterestStateModel) {
        return state.currentIndexId;
    }

    @Selector()
    public static getCurrentIndexData(state: InterestStateModel) {
        return state.currentIndexData;
    }

    @Selector()
    public static getIndexDataCache(state: InterestStateModel) {
        return state.indexDataCache;
    }

    public async ngxsOnInit(ctx: StateContext<InterestStateModel>) {
        this.platform.ready().then(async () => {
            ctx.dispatch(new LoadInterests());

            // Update location whenever Geolocation services become available and no location has been selected yet
            this.diagnostic.registerLocationStateChangeHandler(async state => {
                if (!ctx.getState().selected) {
                    await this.service.checkForLocation();
                }
            });

            if (!ctx.getState().selected) {
                await this.service.checkForLocation();
            }
        });
    }

    @Action(LoadInterests)
    public async loadInterests(ctx: StateContext<InterestStateModel>) {
        let loadedInterests: Interest[] = await this.storage.get(
            InterestState.STORAGE_KEY
        );

        if (loadedInterests === null) {
            loadedInterests = [];
        }

        for (let i = 0; i < loadedInterests.length; i++) {
            loadedInterests[i].osmLocation = new OpenstreetmapLocation(
                loadedInterests[i].osmLocation
            );
        }

        const state = ctx.getState();
        ctx.setState({
            ...state,
            interests: loadedInterests
        });
        this.updateSelectedObject(ctx);
    }

    @Action(FavoriseInterest)
    public async favoriseInterest(
        ctx: StateContext<InterestStateModel>,
        action: FavoriseInterest
    ) {
        const interests = Array.from(ctx.getState().interests);
        const index = this.findInterestIndex(interests, action.osmId);
        if (index > -1) {
            const interest = { ...interests[index] };
            interest.isFavorite = action.isFavorite;
            interests[index] = interest;
        }
        await this.storage.set(InterestState.STORAGE_KEY, interests);
        ctx.patchState({ interests: interests });
        this.updateSelectedObject(ctx);
    }

    @Action(SelectInterest)
    public async selectInterest(
        ctx: StateContext<InterestStateModel>,
        action: SelectInterest
    ) {
        const originalInterests = Array.from(ctx.getState().interests);
        const foundInterests = remove(
            originalInterests,
            (item: Interest) => item.osmLocation.osmId === action.osmId
        );

        let interest: Interest;
        if (foundInterests && foundInterests.length > 0) {
            interest = { ...foundInterests[0] };
        } else {
            interest = await this.service.getLocation(action.osmId);
        }

        interest.availableIndices = [
            new EOIndex('trueColor'),
            new EOIndex('ndvi'),
            new EOIndex('ndsi'),
            new EOIndex('agriculture'),
            new EOIndex('ndwi'),
            new EOIndex('ndbi')
        ];

        originalInterests.unshift(interest);
        ctx.patchState({
            interests: originalInterests,
            selected: interest,
            currentIndexId: 0,
            currentIndex: interest.availableIndices[0],
            currentIndexData: null
        });
    }

    @Action(NextIndex)
    public nextIndex(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();
        const nextIndex = rotatingClamp(
            state.currentIndexId + 1,
            0,
            state.selected.availableIndices.length - 1
        );

        ctx.patchState({
            currentIndexId: nextIndex,
            currentIndex: state.selected.availableIndices[nextIndex],
            currentIndexData: null
        });
    }

    @Action(PreviousIndex)
    public previousIndex(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();
        const nextIndex = rotatingClamp(
            state.currentIndexId - 1,
            0,
            state.selected.availableIndices.length - 1
        );

        ctx.patchState({
            currentIndexId: nextIndex,
            currentIndex: state.selected.availableIndices[nextIndex],
            currentIndexData: null
        });
    }

    @Action(LoadCurrentIndexData)
    public async loadIndexData(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();

        if (!state.currentIndex || !state.selected) {
            return null;
        }

        const indexData = await this.openEOService.loadIndexData(
            state.currentIndex,
            state.selected.osmLocation,
            state.indexDataCache
        );
        if (indexData !== null) {
            const newState = ctx.getState();

            // user might have switched to another index or location while fetching the data
            if (
                newState.currentIndex === state.currentIndex &&
                newState.selected.osmLocation.osmId ===
                    state.selected.osmLocation.osmId
            ) {
                ctx.patchState({
                    currentIndexData: indexData
                });
            }
        }
    }

    @Action(CacheIndexData)
    public cacheIndexData(
        ctx: StateContext<InterestStateModel>,
        action: CacheIndexData
    ) {
        ctx.patchState({
            indexDataCache: ctx
                .getState()
                .indexDataCache.set(action.data.cacheId, action.data)
        });
    }

    private findInterestIndex(interests: Interest[], osmId: number) {
        return findIndex(
            interests,
            (item: Interest) => item.osmLocation.osmId === osmId
        );
    }

    private updateSelectedObject(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();

        if (!state.selected) {
            return;
        }

        const index = this.findInterestIndex(
            state.interests,
            state.selected.osmLocation.osmId
        );
        if (index > -1) {
            ctx.patchState({
                selected: state.interests[index]
            });
        }
    }
}
