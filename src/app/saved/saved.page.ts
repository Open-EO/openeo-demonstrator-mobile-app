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
import { Observable } from 'rxjs';
import { Annotation } from '../core/annotation/annotation';
import { Select, Store } from '@ngxs/store';
import { AnnotationState } from '../core/annotation/annotation.state';
import { SelectAnnotation } from '../core/annotation/annotation.actions';

@Component({
    selector: 'app-saved',
    templateUrl: './saved.page.html',
    styleUrls: ['./saved.page.scss']
})
export class SavedPage {
    @Select(AnnotationState.getAll)
    public annotations$: Observable<Annotation[]>;

    public constructor(private store: Store) {}

    public select(annotation: Annotation) {
        this.store.dispatch(new SelectAnnotation(annotation));
    }
}
