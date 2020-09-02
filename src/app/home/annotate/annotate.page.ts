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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Annotation } from '../../core/annotation/annotation';
import { Store } from '@ngxs/store';
import { InterestState } from '../../core/interest/interest.state';
import { Navigate } from '@ngxs/router-plugin';
import { SaveAnnotation } from '../../core/annotation/annotation.actions';

@Component({
    selector: 'app-annotate',
    templateUrl: './annotate.page.html',
    styleUrls: ['./annotate.page.scss']
})
export class AnnotatePage implements OnInit {
    public annotation: Annotation;

    constructor(private router: Router, private store: Store) {
        this.annotation = new Annotation({});
    }

    public ngOnInit() {
        this.setData();
    }

    public async save() {
        await this.store.dispatch(new SaveAnnotation(this.annotation));
        await this.store.dispatch(new Navigate(['/tabs/home']));
    }

    private setData() {
        const state = this.router.getCurrentNavigation().extras.state;
        if (state && state.dataUrl) {
            this.annotation.imageDataUrl = state.dataUrl;
        }

        this.annotation.osmId = this.store.selectSnapshot(
            InterestState.getSelected
        ).osmLocation.osmId;
        this.annotation.retrievalDate = this.store.selectSnapshot(
            InterestState.getRetrievalDate
        );
        this.annotation.retrievalStartDate = this.store.selectSnapshot(
            InterestState.getRetrievalStartDate
        );
        this.annotation.retvievalTimespan = this.store.selectSnapshot(
            InterestState.getRetrievalTimespan
        );
        this.annotation.eoIndexKey = this.store.selectSnapshot(
            InterestState.getCurrentIndex
        ).key;
    }
}
