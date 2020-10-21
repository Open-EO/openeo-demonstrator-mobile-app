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
import { DataProvider } from '../../core/data-provider/data-provider';
import { Select, Store } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { Navigate } from '@ngxs/router-plugin';
import { SetBandsForProvider } from '../../core/data-provider/data-provider.actions';

@Component({
    selector: 'app-bands-setup',
    templateUrl: './bands-setup.page.html',
    styleUrls: ['./bands-setup.page.scss']
})
export class BandsSetupPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public provider: DataProvider;
    public model: any;
    public bands: any;
    private providerSubscription: Subscription;

    constructor(private store: Store) {}

    ngOnInit() {
        this.providerSubscription = this.provider$.subscribe(
            async (value: DataProvider) => {
                this.provider = value;
                if (this.provider.connection === null) {
                    // We should always be connected on this page already but if not, let's redirect somewhere else
                    this.store.dispatch(new Navigate(['/tabs/open-eo']));

                    return;
                }

                const collectionInfo = await this.provider.connection.describeCollection(
                    this.provider.collectionId
                );
                this.bands = collectionInfo['cube:dimensions'].bands;
                this.model = { ...this.provider.bands };
            }
        );
    }

    ngOnDestroy() {
        this.providerSubscription.unsubscribe();
        this.store.dispatch(
            new SetBandsForProvider(this.model, this.provider.url)
        );
    }
}
