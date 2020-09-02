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
    UpdateIndexData,
    UpdateRetrievalDate,
    UpdateRetrievalTimespan,
    GPSStateChanged,
    SelectIndex
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
import { remove, findIndex, find } from 'lodash';
import { EOIndex } from '../open-eo/eo-index';
import { OpenEOService } from '../open-eo/open-eo.service';
import { IndexData } from '../open-eo/index-data';
import { dateOfTodayWithoutTime, rotatingClamp } from '../utils';
import { Platform } from '@ionic/angular';
import { EnvironmentService } from '../environment/environment.service';

export interface InterestStateModel {
    interests: Interest[];
    selected: Interest;
    currentIndexId: number;
    currentIndex: EOIndex;
    currentIndexData: IndexData;
    indexDataCache: Map<string, IndexData>;
    retrievalDate: Date;
    retrievalStartDate: Date;
    retrievalTimespan: number;
}

@State<InterestStateModel>({
    name: 'interest',
    defaults: {
        interests: [], // recently loaded interests
        selected: null,
        currentIndexId: 0,
        currentIndex: null,
        currentIndexData: null,
        indexDataCache: new Map<string, IndexData>(),
        retrievalDate: dateOfTodayWithoutTime(),
        retrievalStartDate: dateOfTodayWithoutTime(),
        retrievalTimespan: 10
    }
})
export class InterestState implements NgxsOnInit {
    private static readonly STORAGE_KEY = 'interests';

    constructor(
        private storage: Storage,
        private service: InterestService,
        private openEOService: OpenEOService,
        private store: Store,
        private platform: Platform,
        private environment: EnvironmentService
    ) {}

    @Selector()
    public static getAll(state: InterestStateModel) {
        return state.interests;
    }

    @Selector()
    public static getByOsmId(state: InterestStateModel) {
        return (id: number) =>
            find(state.interests, item => item.osmLocation.osmId === id);
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

    @Selector()
    public static getRetrievalDate(state: InterestStateModel) {
        return state.retrievalDate;
    }

    @Selector()
    public static getRetrievalStartDate(state: InterestStateModel) {
        return state.retrievalStartDate;
    }

    @Selector()
    public static getRetrievalTimespan(state: InterestStateModel) {
        return state.retrievalTimespan;
    }

    public async ngxsOnInit(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();
        ctx.patchState({
            retrievalStartDate: this.calculateStartDate(
                state.retrievalDate,
                state.retrievalTimespan
            )
        });
    }

    @Action(GPSStateChanged)
    public async gpsStateChanged(ctx: StateContext<InterestStateModel>) {
        if (!ctx.getState().selected) {
            await this.service.checkForLocation();
        }
    }

    @Action(LoadInterests)
    public async loadInterests(ctx: StateContext<InterestStateModel>) {
        const loadedInterests: any[] = await this.storage.get(
            InterestState.STORAGE_KEY
        );

        const interests: Interest[] = [];
        if (Array.isArray(loadedInterests)) {
            loadedInterests.forEach(data => {
                interests.push(new Interest(data));
            });
        }

        const state = ctx.getState();
        ctx.setState({
            ...state,
            interests: interests
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

        const interest = await this.service.getLocation(action.osmId);
        if (foundInterests && foundInterests.length > 0) {
            interest.isFavorite = foundInterests[0].isFavorite;
        }

        interest.availableIndices = [];
        for (
            let i = 0;
            i < this.environment.openEO.indices.indexOrder.length;
            i++
        ) {
            interest.availableIndices.push(
                new EOIndex(this.environment.openEO.indices.indexOrder[i])
            );
        }

        originalInterests.unshift(interest);
        await this.storage.set(InterestState.STORAGE_KEY, originalInterests);

        ctx.patchState({
            interests: originalInterests,
            selected: interest,
            currentIndexId: 0,
            currentIndex: interest.availableIndices[0]
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
            currentIndex: state.selected.availableIndices[nextIndex]
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
            currentIndex: state.selected.availableIndices[nextIndex]
        });
    }

    @Action(SelectIndex)
    public selectIndex(
        ctx: StateContext<InterestStateModel>,
        action: SelectIndex
    ) {
        const availableIndices = ctx.getState().selected.availableIndices;
        const eoIndexId = availableIndices.findIndex(
            value => value.key === action.indexKey
        );
        ctx.patchState({
            currentIndexId: eoIndexId,
            currentIndex: availableIndices[eoIndexId]
        });
    }

    @Action(LoadCurrentIndexData)
    public async loadIndexData(ctx: StateContext<InterestStateModel>) {
        const state = ctx.getState();

        if (!state.currentIndex || !state.selected) {
            return null;
        }

        await this.openEOService.loadIndexData(
            state.currentIndex,
            state.selected.osmLocation,
            state.indexDataCache,
            state.retrievalDate,
            state.retrievalStartDate
        );
    }

    @Action(UpdateIndexData)
    public cacheIndexData(
        ctx: StateContext<InterestStateModel>,
        action: UpdateIndexData
    ) {
        // Reset the current data in case the same data object is set again to make sure
        // the currentIndexData observable is fired in any case
        ctx.patchState({
            currentIndexData: null
        });

        const state = ctx.getState();

        if (!state.indexDataCache.has(action.data.cacheId)) {
            ctx.patchState({
                indexDataCache: state.indexDataCache.set(
                    action.data.cacheId,
                    action.data
                )
            });
        }

        if (
            state.currentIndex.key === action.data.index.key &&
            state.selected.osmLocation.osmId === action.data.location.osmId
        ) {
            ctx.patchState({
                currentIndexData: action.data
            });
        }
    }

    @Action(UpdateRetrievalDate)
    public updateRetrievalDate(
        ctx: StateContext<InterestStateModel>,
        action: UpdateRetrievalDate
    ) {
        ctx.patchState({
            retrievalDate: action.retrievalDate,
            retrievalStartDate: this.calculateStartDate(
                action.retrievalDate,
                ctx.getState().retrievalTimespan
            )
        });
    }

    @Action(UpdateRetrievalTimespan)
    public updateRetrievalTimespan(
        ctx: StateContext<InterestStateModel>,
        action: UpdateRetrievalTimespan
    ) {
        ctx.patchState({
            retrievalTimespan: action.retrievalTimespan,
            retrievalStartDate: this.calculateStartDate(
                ctx.getState().retrievalDate,
                action.retrievalTimespan
            )
        });
    }

    private calculateStartDate(endDate: Date, timespan: number): Date {
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - timespan);

        return startDate;
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
