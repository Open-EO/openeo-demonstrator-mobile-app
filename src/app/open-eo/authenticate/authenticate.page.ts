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

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    Actions,
    ofActionErrored,
    ofActionSuccessful,
    Select,
    Store
} from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { AuthType, DataProvider } from '../../core/data-provider/data-provider';
import {
    AuthenticateDataProvider,
    SelectDataProvider
} from '../../core/data-provider/data-provider.actions';
import { AuthData } from '../../core/open-eo/auth-data';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Navigate } from '@ngxs/router-plugin';

@Component({
    selector: 'app-authenticate',
    templateUrl: './authenticate.page.html'
})
export class AuthenticatePage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public authData: AuthData;
    public provider: DataProvider = null;
    public authMethod = AuthType.Basic;
    public authTypeEnum = AuthType;
    public hasError = false;
    private providerSubscription: Subscription;
    private signInSubscription: Subscription;
    private errorSubscription: Subscription;
    private loading: any;

    constructor(
        private store: Store,
        private actions$: Actions,
        private router: Router,
        private loadingController: LoadingController
    ) {}

    ngOnInit(): void {
        this.providerSubscription = this.provider$.subscribe(
            (value: DataProvider) => (this.provider = { ...value })
        );
        this.authData = new AuthData('', '', '');
    }

    ngOnDestroy(): void {
        this.providerSubscription.unsubscribe();
    }

    public async signIn() {
        this.loading = await this.loadingController.create({
            message: 'Signing you in...'
        });
        await this.loading.present();

        this.hasError = false;
        this.provider.authType = this.authMethod;
        this.provider.authData = this.authData;

        this.store.dispatch(new AuthenticateDataProvider(this.provider));
        this.signInSubscription = this.actions$
            .pipe(ofActionSuccessful(AuthenticateDataProvider))
            .subscribe(async () => {
                this.signInSubscription.unsubscribe();
                this.store.dispatch(new SelectDataProvider(this.provider));
                this.actions$
                    .pipe(ofActionSuccessful(SelectDataProvider))
                    .subscribe(() => {
                        // intentionally not awaiting this as navigating to the next page should continue immediately
                        this.loading.dismiss();
                        this.store.dispatch(
                            new Navigate(
                                ['/tabs/open-eo/provider-info'],
                                null,
                                { replaceUrl: true }
                            )
                        );
                    });
            });
        this.errorSubscription = this.actions$
            .pipe(ofActionErrored(AuthenticateDataProvider))
            .subscribe(async () => {
                this.errorSubscription.unsubscribe();
                this.hasError = true;
                await this.loading.dismiss();
            });
    }
}
