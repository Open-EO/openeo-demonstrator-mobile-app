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

import { Component, OnDestroy } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { DataProvider } from '../../core/data-provider/data-provider';
import { ToggleDataProvider } from '../../core/data-provider/data-provider.actions';
import { Router } from '@angular/router';
import { NavParams } from '@ionic/angular';
import { Navigate, RouterNavigation } from '@ngxs/router-plugin';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-servers-popover',
    templateUrl: './servers-popover.component.html',
    styleUrls: ['./servers-popover.component.scss']
})
export class ServersPopoverComponent implements OnDestroy {
    @Select(DataProviderState.getAvailable)
    public servers$: Observable<DataProvider[]>;
    private readonly popover: any;
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private store: Store,
        private router: Router,
        private actions$: Actions,
        navParams: NavParams
    ) {
        this.popover = navParams.get('popover');
        this.actions$
            .pipe(
                ofActionSuccessful(RouterNavigation),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                if (this.popover) {
                    // Intentionally not awaiting this as it will block navigating to the new page
                    this.popover.dismiss();
                }
            });
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
    }

    public async toggleProvider(provider: DataProvider) {
        this.store.dispatch(new ToggleDataProvider(provider.url));
    }

    public async manage() {
        this.store.dispatch(
            new Navigate(['/tabs/open-eo'], null, { fragment: 'providers' })
        );
    }
}
