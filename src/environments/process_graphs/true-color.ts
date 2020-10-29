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

import { BoundingBox } from '../../app/core/open-eo/bounding-box';
import { DataProvider } from '../../app/core/data-provider/data-provider';
import { Bands, loadCollection, reduceTemporal, save, scale } from './base';

export function trueColor(
    dataProvider: DataProvider,
    startDate: Date,
    endDate: Date,
    boundingBox: BoundingBox,
    geoJson: any
): any {
    return {
        process_graph: {
            dc: loadCollection(
                dataProvider,
                startDate,
                endDate,
                boundingBox,
                geoJson,
                [Bands.RED, Bands.GREEN, Bands.BLUE]
            ),
            reduce: reduceTemporal('dc'),
            scale: scale(dataProvider, 'reduce', 0, 3000),
            save: save(
                dataProvider,
                [Bands.RED, Bands.GREEN, Bands.BLUE],
                'scale'
            )
        }
    };
}
