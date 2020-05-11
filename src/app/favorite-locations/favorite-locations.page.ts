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

import { SelectInterest } from '../core/interest/interest.actions';
import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { InterestState } from '../core/interest/interest.state';
import { Interest } from '../core/interest/interest';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-favorite-locations',
    templateUrl: './favorite-locations.page.html'
})
export class FavoriteLocationsPage {
    @Select(InterestState.getFavorites)
    public favorites$: Observable<Interest[]>;

    constructor(private store: Store, private router: Router) {}

    public onSelectInterest(interest: Interest) {
        this.store.dispatch(new SelectInterest(interest.osmLocation.osmId));
        this.router.navigate(['/tabs/home']);
    }
}
