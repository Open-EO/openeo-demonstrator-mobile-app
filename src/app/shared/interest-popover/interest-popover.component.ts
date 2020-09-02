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

import { Component, Input, OnInit } from '@angular/core';
import { Interest } from '../../core/interest/interest';
import { Store } from '@ngxs/store';
import { SelectInterest } from '../../core/interest/interest.actions';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-interest-popover',
    templateUrl: './interest-popover.component.html',
    styleUrls: ['./interest-popover.component.scss']
})
export class InterestPopoverComponent {
    @Input()
    public interests: Interest[];

    public constructor(
        private store: Store,
        private popoverController: PopoverController
    ) {}

    public async onSelectInterest(event) {
        await this.store.dispatch(new SelectInterest(event.osmLocation.osmId));
        await this.popoverController.dismiss();
    }
}
