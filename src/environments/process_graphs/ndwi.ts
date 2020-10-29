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
import { Bands, loadCollection, reduceTemporal, save, scale } from './base';
import { DataProvider } from '../../app/core/data-provider/data-provider';

export function ndwi(
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
                [Bands.NIR, Bands.GREEN]
            ),
            diff: {
                process_id: 'reduce_dimension',
                arguments: {
                    data: {
                        from_node: 'dc'
                    },
                    reducer: {
                        process_graph: {
                            nir: {
                                process_id: 'array_element',
                                arguments: {
                                    data: {
                                        from_parameter: 'data'
                                    },
                                    index: 0
                                }
                            },
                            green: {
                                process_id: 'array_element',
                                arguments: {
                                    data: {
                                        from_parameter: 'data'
                                    },
                                    index: 1
                                }
                            },
                            diff: {
                                process_id: 'normalized_difference',
                                arguments: {
                                    x: {
                                        from_node: 'nir'
                                    },
                                    y: {
                                        from_node: 'green'
                                    }
                                },
                                result: true
                            }
                        }
                    },
                    dimension: 'bands'
                }
            },
            reduce: reduceTemporal('diff'),
            scale: scale(dataProvider),
            save: save(dataProvider)
        }
    };
}
