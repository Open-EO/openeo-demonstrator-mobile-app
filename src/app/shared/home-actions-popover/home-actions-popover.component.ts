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

import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Interest } from '../../core/interest/interest';
import { Select } from '@ngxs/store';
import { InterestState } from '../../core/interest/interest.state';
import { Observable } from 'rxjs';

export enum HomeActionsPopoverValues {
    Favorise,
    Share,
    Annotate
}

@Component({
    selector: 'app-home-actions-popover',
    templateUrl: './home-actions-popover.component.html',
    styleUrls: ['./home-actions-popover.component.scss']
})
export class HomeActionsPopoverComponent {
    @Select(InterestState.getSelected)
    public selectedInterest$: Observable<Interest>;

    private readonly popover: any;

    constructor(navParams: NavParams) {
        this.popover = navParams.get('popover');
    }

    public favorise() {
        this.close(HomeActionsPopoverValues.Favorise);
    }

    public share() {
        this.close(HomeActionsPopoverValues.Share);
    }

    public annotate() {
        this.close(HomeActionsPopoverValues.Annotate);
    }

    private close(value: HomeActionsPopoverValues) {
        this.popover.dismiss(value);
    }
}
