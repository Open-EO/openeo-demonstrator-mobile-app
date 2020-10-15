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
import { Observable, Subject, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';
import { Navigate } from '@ngxs/router-plugin';

@Component({
    selector: 'app-authenticate-page',
    templateUrl: './authenticate.page.html'
})
export class AuthenticatePage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public provider: DataProvider = null;
    public authResultSubject: Subject<any> = new Subject<any>();
    private subscriptions: Subscription[] = [];

    constructor(private store: Store) {
        this.subscriptions.push(
            this.authResultSubject.subscribe(success => {
                this.store.dispatch(
                    new Navigate(['/tabs/open-eo'], null, { replaceUrl: true })
                );
            })
        );
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.provider$.subscribe(
                (value: DataProvider) => (this.provider = { ...value })
            )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
