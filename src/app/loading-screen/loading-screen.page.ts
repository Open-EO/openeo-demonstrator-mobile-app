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
import {
    GPSStateChanged,
    LoadInterests
} from '../core/interest/interest.actions';
import { ModalController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Select, Store } from '@ngxs/store';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LoadAnnotations } from '../core/annotation/annotation.actions';
import {
    LoadDataProviders,
    SignOutDataProvider,
    ToggleDataProvider
} from '../core/data-provider/data-provider.actions';
import { DataProviderState } from '../core/data-provider/data-provider.state';
import { Observable, Subject } from 'rxjs';
import { AuthenticateComponent } from '../shared/authenticate/authenticate.component';
import { Navigate } from '@ngxs/router-plugin';
import { DataProvider } from '../core/data-provider/data-provider';

@Component({
    selector: 'app-loading-screen',
    templateUrl: './loading-screen.page.html',
    styleUrls: ['./loading-screen.page.scss']
})
export class LoadingScreenPage implements OnInit {
    private static readonly TEXT_DEFAULT = 'Loading';
    private static readonly TEXT_GPS = 'Checking GPS privileges';
    private static readonly TEXT_DATA = 'Loading preferences';
    private static readonly TEXT_PROVIDERS = 'Authenticating providers';

    @Select(DataProviderState.getNeedAuthenticating)
    public providersNeedAuthenticating$: Observable<DataProvider[]>;
    public text: string = LoadingScreenPage.TEXT_DEFAULT;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private store: Store,
        private diagnostic: Diagnostic,
        private modalController: ModalController
    ) {}

    public async ngOnInit() {
        this.platform.ready().then(async () => {
            await this.setupGPS();
            await this.loadData();
            await this.authenticateProviders();
            await this.continue();
        });
    }

    private loadData(): Promise<any> {
        this.text = LoadingScreenPage.TEXT_DATA;

        return this.store
            .dispatch([
                new LoadInterests(),
                new LoadAnnotations(),
                new LoadDataProviders()
            ])
            .toPromise();
    }

    private async authenticateProviders() {
        const providers = await this.store.selectSnapshot(
            DataProviderState.getNeedAuthenticating
        );
        for (let i = 0; i < providers.length; i++) {
            const finished = new Subject<boolean>();
            const modal = await this.modalController.create({
                component: AuthenticateComponent,
                componentProps: {
                    dataProvider: { ...providers[i] },
                    resultSubject: finished
                }
            });
            await modal.present();

            const result = await finished.toPromise();
            if (result === false) {
                this.store.dispatch(new SignOutDataProvider(providers[i]));
            }

            await modal.dismiss();
        }
    }

    private async setupGPS() {
        this.text = LoadingScreenPage.TEXT_GPS;

        this.diagnostic.registerLocationStateChangeHandler(() =>
            this.store.dispatch(new GPSStateChanged())
        );
        this.store.dispatch(new GPSStateChanged());
    }

    private async continue() {
        await this.store.dispatch(new Navigate(['/tabs']));
    }
}
