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
import { Select } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';
import { Capabilities } from '@openeo/js-client';

@Component({
    selector: 'app-capabilities',
    templateUrl: './capabilities.page.html'
})
export class CapabilitiesPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public capabilities: Capabilities;
    private providerSubscription: Subscription;

    public async ngOnInit() {
        this.providerSubscription = this.provider$.subscribe(
            async value =>
                (this.capabilities = await value.connection.capabilities())
        );
    }

    public async ngOnDestroy() {
        this.providerSubscription.unsubscribe();
    }
}
