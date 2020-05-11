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
import { Select, Store } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';
import {
    QuickConnectSelectedDataProvider,
    RemoveDataProvider,
    SignOutDataProvider
} from '../../core/data-provider/data-provider.actions';
import { DataProviderService } from '../../core/data-provider/data-provider.service';

@Component({
    selector: 'app-provider-info',
    templateUrl: './provider-info.page.html'
})
export class ProviderInfoPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public provider: DataProvider;
    public capabilities: any;
    public description: string;
    private providerSubscription: Subscription;

    constructor(private store: Store, private service: DataProviderService) {}

    ngOnInit(): void {
        this.providerSubscription = this.provider$.subscribe(
            async (value: DataProvider) => {
                this.provider = value;
                if (this.provider.connection === null) {
                    // We don't want to actually enable and use this provider, we just need to connect to it
                    // temporarily to fetch the relevant information.
                    this.store.dispatch(
                        new QuickConnectSelectedDataProvider(this.provider)
                    );

                    // This method is called again with the connected data provider so we just quit here for now.
                    return;
                }
                this.capabilities = this.provider.connection.capabilities();
                this.description = this.capabilities
                    .description()
                    .replace(/(\r\n|\n|\r)/g, '<br>');
            }
        );
    }

    ngOnDestroy(): void {
        this.providerSubscription.unsubscribe();
    }

    public signOut() {
        this.store.dispatch(new SignOutDataProvider(this.provider));
    }

    public remove() {
        this.store.dispatch(new RemoveDataProvider(this.provider));
    }
}
