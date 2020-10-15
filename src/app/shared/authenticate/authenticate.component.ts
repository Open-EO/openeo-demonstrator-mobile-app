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

import { Component, Input } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { AuthType, DataProvider } from '../../core/data-provider/data-provider';
import { AuthData } from '../../core/open-eo/auth-data';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticateDataProvider } from '../../core/data-provider/data-provider.actions';

@Component({
    selector: 'app-authenticate',
    templateUrl: './authenticate.component.html'
})
export class AuthenticateComponent {
    @Input()
    public contentOnly = false;
    @Input()
    public dataProvider: DataProvider = null;
    @Input()
    public resultSubject = new Subject<boolean>();

    public authData: AuthData;
    public authMethod = AuthType.Basic;
    public authTypeEnum = AuthType;
    public hasError = false;
    private loading: any;

    constructor(
        private store: Store,
        private actions$: Actions,
        private router: Router,
        private loadingController: LoadingController
    ) {
        this.authData = new AuthData('', '', '');
    }

    public async signIn() {
        this.loading = await this.loadingController.create({
            message: 'Signing you in...'
        });
        await this.loading.present();

        this.hasError = false;
        this.dataProvider.authType = this.authMethod;
        this.dataProvider.authData = this.authData;

        try {
            await this.store
                .dispatch(new AuthenticateDataProvider(this.dataProvider))
                .toPromise();
        } catch (e) {
            this.hasError = true;
        }

        await this.loading.dismiss();
        if (this.hasError === false) {
            this.return(true);
        }
    }

    public return(success: boolean) {
        this.resultSubject.next(success);
        this.resultSubject.complete();
    }
}
