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
import { DataProviderService } from '../../core/data-provider/data-provider.service';

@Component({
    selector: 'app-processes',
    templateUrl: './processes.page.html'
})
export class ProcessesPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public processes: any = null;
    private providerSubscription: Subscription;

    constructor(private service: DataProviderService) {}

    public async ngOnInit() {
        this.providerSubscription = this.provider$.subscribe(async provider => {
            // We can't use the provided connection here as `listProcesses` changes
            // the connection object which is not allowed as it is marked immutable
            // in the store.
            const connection = await this.service.connectProvider(provider);
            this.processes = await connection.listProcesses();
        });
    }

    public async ngOnDestroy() {
        this.providerSubscription.unsubscribe();
    }
}
