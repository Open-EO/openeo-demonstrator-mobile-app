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

import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';
import {
    SelectDataProvider,
    ToggleDataProvider
} from '../../core/data-provider/data-provider.actions';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-open-eo',
    templateUrl: './open-eo.page.html',
    styleUrls: ['./open-eo.page.scss']
})
export class OpenEOPage implements OnDestroy {
    private static readonly SCROLL_TOP_OFFSET = 80;
    private static readonly SCROLL_DURATION = 1000;

    @Select(DataProviderState.getAll)
    public servers$: Observable<DataProvider[]>;
    @ViewChild(IonContent, { static: false })
    public ionContent: IonContent;
    private fragmentSubscription: Subscription;

    constructor(
        private store: Store,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private actions$: Actions,
        private alertController: AlertController,
        private storage: Storage
    ) {}

    public ngOnDestroy() {
        if (this.fragmentSubscription) {
            this.fragmentSubscription.unsubscribe();
        }
    }

    /**
     * Called automatically by Ionic
     */
    public async ionViewDidEnter() {
        if (this.fragmentSubscription) {
            this.fragmentSubscription.unsubscribe();
        }

        this.fragmentSubscription = this.activatedRoute.fragment.subscribe(
            fragment => {
                if (fragment) {
                    const anchor = document.getElementById(fragment);
                    this.ionContent.scrollByPoint(
                        0,
                        anchor.getBoundingClientRect().top -
                            OpenEOPage.SCROLL_TOP_OFFSET,
                        OpenEOPage.SCROLL_DURATION
                    );
                }
            }
        );
    }

    public async toggleProvider(provider: DataProvider) {
        this.store.dispatch(new ToggleDataProvider(provider.url));
    }

    public async providerInfo(provider: DataProvider) {
        this.store.dispatch(new SelectDataProvider(provider));
        this.actions$
            .pipe(ofActionSuccessful(SelectDataProvider))
            .subscribe(
                async () =>
                    await this.router.navigate(['/tabs/open-eo/provider-info'])
            );
    }

    public async providerAuthenticate(provider: DataProvider) {
        this.store.dispatch(new SelectDataProvider(provider));
        this.actions$
            .pipe(ofActionSuccessful(SelectDataProvider))
            .subscribe(
                async () =>
                    await this.router.navigate(['/tabs/open-eo/authenticate'])
            );
    }

    public async onReset() {
        const alert = await this.alertController.create({
            header: 'Reset',
            message:
                'Are you sure you want to delete all stored data from the app? This cannot be undone and will remove all' +
                'provider credentials, custom backends, favourites, etc.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel'
                },
                {
                    text: 'Reset',
                    cssClass: 'danger',
                    handler: async () => {
                        await this.reset();
                    }
                }
            ]
        });

        await alert.present();
    }

    private async reset() {
        await this.storage.clear();

        const alert = await this.alertController.create({
            header: 'App reset',
            message:
                'The app was reset. Please restart it in order for the changes to take effect.',
            buttons: ['Ok']
        });
        await alert.present();
    }
}
