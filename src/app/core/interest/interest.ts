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

import { EOIndex } from '../open-eo/eo-index';
import { OpenstreetmapLocation } from '../openstreetmap/openstreetmap-location';

/**
 * Represents an area/location of interest. To prevent confusions with the
 * location class describing an openstreetmap location, this class was renamed
 * to "Interest".
 */
export class Interest {
    osmLocation: OpenstreetmapLocation;
    isFavorite = false;
    availableIndices: EOIndex[] = [];

    constructor(data: any) {
        if (data.osmLocation) {
            data.osmLocation = new OpenstreetmapLocation(data.osmLocation);
        }
        Object.assign(this, data);
    }
}
