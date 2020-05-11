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
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';

@Component({
    selector: 'app-collections',
    templateUrl: './collections.page.html'
})
export class CollectionsPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public filteredCollections: any[] = null;
    public filterKeyword = '';
    private collections: any[] = null;
    private providerSubscription: Subscription;
    private providerUrl = '';

    constructor(private router: Router) {}

    public async ngOnInit() {
        this.providerSubscription = this.provider$.subscribe(async value => {
            const collectionsList = await value.connection.listCollections();
            this.collections = collectionsList.collections;
            this.filterCollections();
            this.providerUrl = value.url;
        });
    }

    public async ngOnDestroy() {
        this.providerSubscription.unsubscribe();
    }

    public onSelect(collection: any) {
        this.router.navigate(
            ['/tabs/open-eo/provider-info/collections/detail'],
            {
                state: collection
            }
        );
    }

    public onFilter(event) {
        this.filterKeyword = event.detail.value.toLowerCase();
        this.filterCollections();
    }

    private filterCollections() {
        if (!this.filterKeyword || this.filterKeyword === '') {
            this.filteredCollections = this.collections;
        } else {
            this.filteredCollections = this.collections.filter(
                (value: any) =>
                    value.id &&
                    value.id.toLowerCase().startsWith(this.filterKeyword)
            );
        }
    }
}
