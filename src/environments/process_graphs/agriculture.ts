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
import { formatDate } from '@angular/common';

export function agriculture(
    collection: string,
    startDate: Date,
    endDate: Date,
    boundingBox: BoundingBox,
    geoJson: any,
    resolution: number
): any {
    return {
        dc: {
            process_id: 'load_collection',
            arguments: {
                id: collection,
                spatial_extent: geoJson,
                temporal_extent: [
                    formatDate(startDate, 'yyyy-MM-dd', 'en'),
                    formatDate(endDate, 'yyyy-MM-dd', 'en')
                ],
                bands: ['B11', 'B8', 'B2']
            }
        },
        reduce: {
            process_id: 'reduce',
            arguments: {
                data: {
                    from_node: 'dc'
                },
                reducer: {
                    callback: {
                        min: {
                            arguments: {
                                data: {
                                    from_argument: 'data'
                                }
                            },
                            process_id: 'min',
                            result: true
                        }
                    }
                },
                dimension: 'temporal'
            }
        },
        scale: {
            process_id: 'apply',
            arguments: {
                data: {
                    from_node: 'reduce'
                },
                process: {
                    callback: {
                        lsr: {
                            arguments: {
                                x: {
                                    from_argument: 'x'
                                },
                                inputMin: 0,
                                inputMax: 2500,
                                outputMin: 0,
                                outputMax: 255
                            },
                            process_id: 'linear_scale_range',
                            result: true
                        }
                    }
                }
            }
        },
        save: {
            process_id: 'save_result',
            arguments: {
                data: {
                    from_node: 'scale'
                },
                format: 'PNG',
                options: {
                    red: 'B11',
                    blue: 'B2',
                    green: 'B8'
                }
            },
            result: true
        }
    };
}
