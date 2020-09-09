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

import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { Platform } from '@ionic/angular';
import {
    RemoveAnnotation,
    LoadAnnotations,
    SaveAnnotation,
    SelectAnnotation
} from './annotation.actions';
import { Annotation } from './annotation';
import { AnnotationService } from './annotation.service';
import { InterestStateModel } from '../interest/interest.state';
import {
    SelectIndex,
    SelectInterest,
    UpdateRetrievalDate,
    UpdateRetrievalTimespan
} from '../interest/interest.actions';
import { Navigate } from '@ngxs/router-plugin';

export interface AnnotationStateModel {
    annotations: Map<string, Annotation>;
}

@State<AnnotationStateModel>({
    name: 'annotation',
    defaults: {
        annotations: new Map<string, Annotation>()
    }
})
export class AnnotationState {
    @Selector()
    public static getAll(state: AnnotationStateModel): Annotation[] {
        return Array.from(state.annotations.values());
    }

    public constructor(
        private platform: Platform,
        private service: AnnotationService
    ) {}

    @Action(LoadAnnotations)
    public async load(ctx: StateContext<AnnotationStateModel>) {
        const annotations = await this.service.load();
        ctx.patchState({
            annotations: annotations
        });
    }

    @Action(SaveAnnotation)
    public async save(
        ctx: StateContext<AnnotationStateModel>,
        action: SaveAnnotation
    ) {
        await this.service.save(action.payload);
        await ctx.dispatch(new LoadAnnotations());
    }

    @Action(RemoveAnnotation)
    public async delete(
        ctx: StateContext<AnnotationStateModel>,
        action: RemoveAnnotation
    ) {
        await this.service.remove(action.payload);
        await ctx.dispatch(new LoadAnnotations());
    }

    @Action(SelectAnnotation)
    public async select(
        ctx: StateContext<AnnotationStateModel>,
        action: SelectAnnotation
    ) {
        await ctx
            .dispatch([
                new SelectInterest(action.payload.osmId),
                new UpdateRetrievalTimespan(action.payload.retvievalTimespan),
                new UpdateRetrievalDate(action.payload.retrievalDate),
                new SelectIndex(action.payload.eoIndexKey)
            ])
            .toPromise();
    }
}
