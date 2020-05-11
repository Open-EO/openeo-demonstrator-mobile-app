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

import { NextIndex, PreviousIndex } from '../../core/interest/interest.actions';
import { Interest } from 'src/app/core/interest/interest';
import { InterestState } from '../../core/interest/interest.state';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-index-slider',
    templateUrl: './index-slider.component.html',
    styleUrls: ['./index-slider.component.scss']
})
export class IndexSliderComponent implements OnInit, OnDestroy {
    @Select(InterestState.getSelected)
    public selectedInterest$: Observable<Interest>;
    @Select(InterestState.getCurrentIndexId)
    public currentIndexId$: Observable<number>;
    public currentIndexId: number;
    private currentIndexSubscription: Subscription;

    constructor(private store: Store) {}

    ngOnInit() {
        this.currentIndexSubscription = this.currentIndexId$.subscribe(
            index => (this.currentIndexId = index)
        );
    }

    ngOnDestroy() {
        this.currentIndexSubscription.unsubscribe();
    }

    public onNext() {
        this.store.dispatch(new NextIndex());
    }

    public onPrevious() {
        this.store.dispatch(new PreviousIndex());
    }
}
