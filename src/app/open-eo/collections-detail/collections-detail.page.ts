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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SetCollectionForSelectedDataProvider } from '../../core/data-provider/data-provider.actions';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';

@Component({
    selector: 'app-collections-detail',
    templateUrl: './collections-detail.page.html'
})
export class CollectionsDetailPage implements OnInit {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public collection: any;
    public provider: DataProvider;
    private providerSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private store: Store
    ) {
        this.collection = this.router.getCurrentNavigation().extras.state;
    }

    public async ngOnInit() {
        this.providerSubscription = this.provider$.subscribe(async value => {
            this.provider = value;
        });
    }

    public useCollection() {
        this.store.dispatch(
            new SetCollectionForSelectedDataProvider(this.collection.id)
        );
    }
}
