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
    InvalidateCurrentIndexData,
    LoadCurrentIndexData,
    NextIndex,
    PreviousIndex
} from '../core/interest/interest.actions';
import { InterestState } from '../core/interest/interest.state';
import { InterestService } from '../core/interest/interest.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Interest } from '../core/interest/interest';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { EOIndex } from '../core/open-eo/eo-index';
import { DataProviderState } from '../core/data-provider/data-provider.state';
import { DataProvider } from '../core/data-provider/data-provider';
import { AlertController, PopoverController } from '@ionic/angular';
import { Navigate } from '@ngxs/router-plugin';
import { IndexData } from '../core/open-eo/index-data';
import { Location } from '../core/open-eo/location';
import { InterestPopoverComponent } from '../shared/interest-popover/interest-popover.component';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { MapComponent } from '../shared/map/map.component';
import {
    HomeActionsPopoverComponent,
    HomeActionsPopoverValues
} from '../shared/home-actions-popover/home-actions-popover.component';
import { debounceTime, takeUntil } from 'rxjs/operators';

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
    @Select(InterestState.isLoading)
    public isLoading$: Observable<boolean>;
    @ViewChild('mapComponent', { static: false })
    public mapComponent: MapComponent;

    public selectedInterest: Interest;
    public currentIndex: EOIndex;
    public dataObjectURL: any = null;
    private isDataProvidersInitialized: boolean;
    private isActivePage = false;
    private activeProviders: DataProvider[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        private interestService: InterestService,
        private store: Store,
        private alertController: AlertController,
        private popoverController: PopoverController,
        private socialSharing: SocialSharing,
        private actions$: Actions
    ) {
        this.actions$
            .pipe(
                ofActionDispatched(InvalidateCurrentIndexData),
                debounceTime(100),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.store.dispatch(new LoadCurrentIndexData());
            });
    }

    public ngOnInit(): void {
        this.store
            .select(InterestState.getSelected)
            .pipe(takeUntil(this.destroy$))
            .subscribe(selected => {
                if (selected === null) {
                    return;
                }

                this.selectedInterest = selected;
            });
        this.store
            .select(InterestState.getCurrentIndex)
            .pipe(takeUntil(this.destroy$))
            .subscribe((index: EOIndex) => {
                this.currentIndex = index;
            });
        this.store
            .select(InterestState.getCurrentIndexData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (data: IndexData) => {
                this.updateCanvas(data);
            });
        this.store
            .select(DataProviderState.getActive)
            .pipe(takeUntil(this.destroy$))
            .subscribe((providers: DataProvider[]) => {
                this.activeProviders = providers;
                this.showPromptIfNoActiveProviders();
            });
        this.store
            .select(DataProviderState.isInitialized)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (initialized: boolean) => {
                this.isDataProvidersInitialized = initialized;
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    /**
     * Called automatically by Ionic
     */
    public async ionViewWillEnter() {
        this.isActivePage = true;
        this.showPromptIfNoActiveProviders();
        this.store.dispatch(new InvalidateCurrentIndexData());
    }

    /**
     * Called automatically by Ionic
     */
    public ionViewWillLeave() {
        this.isActivePage = false;
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

    public async actions(event) {
        let popover = null;
        popover = await this.popoverController.create({
            component: HomeActionsPopoverComponent,
            componentProps: {
                popover: popover
            },
            event: event,
            animated: true,
            showBackdrop: true
        });
        await popover.present();
        const result = await popover.onDidDismiss();
        switch (result.data) {
            case HomeActionsPopoverValues.Favorise:
                await this.favorise();
                break;
            case HomeActionsPopoverValues.Share:
                await this.share();
                break;
            case HomeActionsPopoverValues.Annotate:
                await this.annotate();
                break;
        }
    }

    private async share() {
        const options = {
            files: [this.getMapImageDataUrl()]
        };

        this.socialSharing
            .shareWithOptions(options)
            .then(result => console.log(result))
            .catch(error => console.error(error));
    }

    private async annotate() {
        this.store.dispatch(
            new Navigate(['/tabs/home/annotate'], null, {
                state: { dataUrl: this.getMapImageDataUrl() }
            })
        );
    }

    private async favorise() {
        await this.store.dispatch(
            new FavoriseInterest(
                this.selectedInterest.osmLocation.osmId,
                !this.selectedInterest.isFavorite
            )
        );
    }

    private getMapImageDataUrl(): string {
        this.mapComponent.cesiumViewer.render();

        return this.mapComponent.cesiumViewer.canvas.toDataURL();
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
