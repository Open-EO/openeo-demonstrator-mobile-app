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
import {
    GPSStateChanged,
    LoadInterests
} from './core/interest/interest.actions';
import { LoadAnnotations } from './core/annotation/annotation.actions';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private store: Store,
        private diagnostic: Diagnostic
    ) {
        this.initializeApp();
    }

    public async initializeApp() {
        this.platform.ready().then(async () => {
            this.statusBar.styleLightContent();

            await this.store
                .dispatch([new LoadInterests(), new LoadAnnotations()])
                .toPromise();

            this.isFullyInitialized();
        });
    }

    private isFullyInitialized() {
        this.splashScreen.hide();
        this.diagnostic.registerLocationStateChangeHandler(() =>
            this.store.dispatch(new GPSStateChanged())
        );
        this.store.dispatch(new GPSStateChanged());
    }
}
