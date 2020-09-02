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

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Annotation } from './annotation';

@Injectable({
    providedIn: 'root'
})
export class AnnotationService {
    private static readonly STORAGE_KEY = 'annotations';

    constructor(private storage: Storage) {}

    public async load(): Promise<Map<string, Annotation>> {
        const annotations = new Map<string, Annotation>();
        const json = await this.storage.get(AnnotationService.STORAGE_KEY);
        if (json) {
            const loadedObjects = new Map<string, any>(JSON.parse(json));
            loadedObjects.forEach((value, key) => {
                value.retrievalStartDate = new Date(value.retrievalStartDate);
                value.retrievalDate = new Date(value.retrievalDate);
                annotations.set(key, new Annotation(value));
            });
        }

        return annotations;
    }

    public async save(annotation: Annotation) {
        const annotations = await this.load();
        annotations.set(annotation.getKey(), annotation);
        await this.storage.set(
            AnnotationService.STORAGE_KEY,
            JSON.stringify(Array.from(annotations))
        );
    }

    public async remove(annotation: Annotation) {
        const annotations = await this.load();
        annotations.delete(annotation.getKey());
        await this.storage.set(
            AnnotationService.STORAGE_KEY,
            JSON.stringify(Array.from(annotations))
        );
    }
}
