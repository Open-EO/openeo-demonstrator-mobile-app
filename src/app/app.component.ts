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
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Store } from '@ngxs/store';
import { DataProviderState } from './core/data-provider/data-provider.state';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    private dataProvidersInitialized = false;
    private subscriptions: Subscription[] = [];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private store: Store
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleLightContent();

            this.subscriptions.push(
                this.store
                    .select(DataProviderState.isInitialized)
                    .subscribe((initialized: boolean) => {
                        this.dataProvidersInitialized = initialized;
                        this.isFullyInitialized();
                    })
            );
        });
    }

    private unsubscribe() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    private isFullyInitialized() {
        if (this.dataProvidersInitialized === true) {
            this.unsubscribe();
            this.splashScreen.hide();
        }
    }
}
