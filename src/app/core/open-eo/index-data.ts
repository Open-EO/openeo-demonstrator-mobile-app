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

import { EOIndex } from './eo-index';
import { OpenstreetmapLocation } from '../openstreetmap/openstreetmap-location';
import { DataProvider } from '../data-provider/data-provider';

export class IndexData {
    public provider: DataProvider;
    public data: any = null;
    public canvas: HTMLCanvasElement = null;

    public get cacheId(): string {
        return (
            this.location.osmId +
            this.index.title +
            this.startDate.toISOString() +
            this.endDate.toISOString()
        );
    }

    constructor(
        public index: EOIndex,
        public location: OpenstreetmapLocation,
        public startDate: Date,
        public endDate: Date
    ) {}
}
