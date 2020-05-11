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

import { InterestService } from '../../core/interest/interest.service';
import { Store } from '@ngxs/store';
import { SelectInterest } from '../../core/interest/interest.actions';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Component, OnInit } from '@angular/core';
import { Interest } from 'src/app/core/interest/interest';
import { PopoverController } from '@ionic/angular';
import { ServersPopoverComponent } from '../servers-popover/servers-popover.component';

@Component({
    selector: 'app-interest-search',
    templateUrl: './interest-search.component.html',
    styleUrls: ['./interest-search.component.scss']
})
export class InterestSearchComponent implements OnInit {
    public contentVisible = false;
    public isBusy = false;
    public searchResults: Interest[] = [];
    public isSearching = false;
    private popover = null;

    constructor(
        private interestService: InterestService,
        private keyboard: Keyboard,
        private store: Store,
        private popoverController: PopoverController
    ) {}

    ngOnInit() {}

    public clearSearch() {
        this.keyboard.hide();
        this.contentVisible = false;
        this.isBusy = false;
    }

    public async onSearch(event) {
        const keyword = event.detail.value;

        if (keyword) {
            this.isBusy = true;
            this.contentVisible = true;

            try {
                this.searchResults = await this.interestService.search(keyword);
            } catch (error) {
                this.contentVisible = false;
                throw error;
            }

            this.isBusy = false;
        } else {
            this.contentVisible = false;
        }
    }

    public async onSelectItem(item: Interest) {
        this.clearSearch();
        this.store.dispatch(new SelectInterest(item.osmLocation.osmId));
    }

    public async onServersPopover(event: any) {
        this.popover = await this.popoverController.create({
            component: ServersPopoverComponent,
            componentProps: {
                popover: this.popover
            },
            event: event,
            animated: true,
            showBackdrop: true
        });

        return await this.popover.present();
    }
}
