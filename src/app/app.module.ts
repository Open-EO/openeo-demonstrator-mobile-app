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

import { HammerConfig } from './core/hammer-config';
import { InterestState } from './core/interest/interest.state';
import { CoreModule } from './core/core.module';
import { NgModule, ErrorHandler } from '@angular/core';
import {
    BrowserModule,
    HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { CustomErrorHandler } from './core/error/custom-error-handler';

import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { DataProviderState } from './core/data-provider/data-provider.state';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { environment } from '../environments/environment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        HttpClientModule,
        CoreModule,
        NgxsModule.forRoot([InterestState, DataProviderState], {
            developmentMode: !environment.production
        }),
        NgxsRouterPluginModule.forRoot(),
        NgxsLoggerPluginModule.forRoot(),
        AppRoutingModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ErrorHandler, useClass: CustomErrorHandler },
        { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
        Geolocation,
        Keyboard,
        Diagnostic
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
