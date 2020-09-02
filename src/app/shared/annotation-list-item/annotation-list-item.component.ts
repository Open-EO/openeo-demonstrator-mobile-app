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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Interest } from '../../core/interest/interest';
import { Annotation } from '../../core/annotation/annotation';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../../core/environment/environment.service';
import { Store } from '@ngxs/store';
import { InterestState } from '../../core/interest/interest.state';
import { map } from 'rxjs/operators';
import { RemoveAnnotation } from '../../core/annotation/annotation.actions';

@Component({
    selector: 'app-annotation-list-item',
    templateUrl: './annotation-list-item.component.html',
    styleUrls: ['annotation-list-item.component.scss']
})
export class AnnotationListItemComponent {
    @Input()
    public set annotation(value: Annotation) {
        this._annotation = value;
        this.interest$ = this.store
            .select(InterestState.getByOsmId)
            .pipe(map(func => func(value.osmId)));
    }
    public get annotation(): Annotation {
        return this._annotation;
    }
    @Output()
    public selected: EventEmitter<Annotation> = new EventEmitter<Annotation>();
    public interest$: Observable<Interest>;

    private _annotation: Annotation;

    constructor(public environment: EnvironmentService, public store: Store) {}

    public select() {
        this.selected.emit(this.annotation);
    }

    public async remove() {
        await this.store.dispatch(new RemoveAnnotation(this.annotation));
    }
}
