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

import {
    FavoriseInterest,
    LoadCurrentIndexData,
    NextIndex,
    PreviousIndex
} from '../core/interest/interest.actions';
import { InterestState } from '../core/interest/interest.state';
import { InterestService } from '../core/interest/interest.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Interest } from '../core/interest/interest';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { EOIndex } from '../core/open-eo/eo-index';
import { DataProviderState } from '../core/data-provider/data-provider.state';
import { DataProvider } from '../core/data-provider/data-provider';
import { AlertController, PopoverController } from '@ionic/angular';
import { Navigate } from '@ngxs/router-plugin';
import { IndexData } from '../core/open-eo/index-data';
import { Location } from '../core/open-eo/location';
import { InterestPopoverComponent } from '../shared/interest-popover/interest-popover.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
    @Select(InterestState.getRetrievalDate)
    public retrievalDate$: Observable<Date>;
    @Select(InterestState.getRetrievalStartDate)
    public retrievalStartDate: Observable<Date>;

    public selectedInterest: Interest;
    public currentIndex: EOIndex;
    public dataObjectURL: any = null;
    private isDataProvidersInitialized: boolean;
    private isActivePage = false;
    private subscriptions: Subscription[] = [];
    private activeProviders: DataProvider[] = [];

    constructor(
        private interestService: InterestService,
        private store: Store,
        private alertController: AlertController,
        private popoverController: PopoverController
    ) {}

    public ngOnInit(): void {
        this.subscriptions = [
            this.store.select(InterestState.getSelected).subscribe(selected => {
                if (selected === null) {
                    return;
                }

                this.selectedInterest = selected;
            }),
            this.store
                .select(InterestState.getCurrentIndex)
                .subscribe((index: EOIndex) => {
                    this.currentIndex = index;
                    this.refreshIndexData();
                }),
            this.store
                .select(InterestState.getCurrentIndexData)
                .subscribe(async (data: IndexData) => {
                    this.updateCanvas(data);
                }),
            this.store
                .select(DataProviderState.getActive)
                .subscribe((providers: DataProvider[]) => {
                    this.activeProviders = providers;
                    this.showPromptIfNoActiveProviders();
                    this.refreshIndexData();
                }),
            this.store
                .select(DataProviderState.isInitialized)
                .subscribe(async (initialized: boolean) => {
                    this.isDataProvidersInitialized = initialized;
                    this.refreshIndexData();
                })
        ];
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    public async ionViewWillEnter() {
        this.isActivePage = true;
        this.showPromptIfNoActiveProviders();
        this.refreshIndexData();
    }

    public ionViewWillLeave() {
        this.isActivePage = false;
    }

    public onFavorise() {
        this.store.dispatch(
            new FavoriseInterest(
                this.selectedInterest.osmLocation.osmId,
                !this.selectedInterest.isFavorite
            )
        );
    }

    public async onSwipeLeft(event) {
        if (this.selectedInterest) {
            this.store.dispatch(new NextIndex());
        }
    }

    public async onSwipeRight(event) {
        if (this.selectedInterest) {
            this.store.dispatch(new PreviousIndex());
        }
    }

    public async onPressMap(location: Location) {
        const interests = await this.interestService.reverseGeocode(
            location.getLatitude(),
            location.getLongitude()
        );

        const popover = await this.popoverController.create({
            component: InterestPopoverComponent,
            componentProps: {
                interests: interests
            },
            animated: true,
            showBackdrop: true
        });
        await popover.present();
    }

    private async refreshIndexData() {
        if (this.isDataProvidersInitialized) {
            this.store.dispatch(new LoadCurrentIndexData());
        }
    }

    private updateCanvas(data: IndexData) {
        if (data && data.canvas) {
            this.dataObjectURL = data.canvas;
        } else {
            this.dataObjectURL = null;
        }
    }

    private async showPromptIfNoActiveProviders() {
        if (
            this.isDataProvidersInitialized &&
            this.activeProviders.length < 1 &&
            this.isActivePage
        ) {
            const alert = await this.alertController.create({
                header: 'No data providers active',
                message:
                    'You need to have at least one data provider activated. Please select one from the list on the openEO page.',
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            this.store.dispatch(
                                new Navigate(['/tabs/open-eo'])
                            );
                        }
                    }
                ]
            });

            await alert.present();
        }
    }
}
