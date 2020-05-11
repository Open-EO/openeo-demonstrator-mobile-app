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
import { DataProvider } from '../../core/data-provider/data-provider';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { AddDataProvider } from '../../core/data-provider/data-provider.actions';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-provider',
    templateUrl: './add-provider.page.html'
})
export class AddProviderPage {
    public provider: DataProvider = new DataProvider();

    private successSubscription: Subscription;

    constructor(
        private store: Store,
        private router: Router,
        private actions$: Actions
    ) {}

    public async save() {
        if (this.provider.name && this.provider.url) {
            this.successSubscription = this.actions$
                .pipe(ofActionSuccessful(AddDataProvider))
                .subscribe(async () => {
                    this.successSubscription.unsubscribe();
                    await this.router.navigate(['/tabs/open-eo']);
                });
            this.store.dispatch(new AddDataProvider(this.provider));
        }
    }
}
