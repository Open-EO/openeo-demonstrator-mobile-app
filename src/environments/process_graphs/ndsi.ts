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

export function ndsi(
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
                spatial_extent: {
                    west: boundingBox.minLongitude,
                    east: boundingBox.maxLongitude,
                    north: boundingBox.maxLatitude,
                    south: boundingBox.minLatitude
                },
                temporal_extent: [
                    formatDate(startDate, 'yyyy-MM-dd', 'en'),
                    formatDate(endDate, 'yyyy-MM-dd', 'en')
                ],
                bands: ['B3', 'B11']
            }
        },
        filter: {
            process_id: 'filter_polygon',
            arguments: {
                data: {
                    from_node: 'dc'
                },
                polygons: geoJson
            }
        },
        green: {
            process_id: 'filter_bands',
            arguments: {
                data: {
                    from_node: 'filter'
                },
                bands: ['B3']
            }
        },
        swir: {
            process_id: 'filter_bands',
            arguments: {
                data: {
                    from_node: 'filter'
                },
                bands: ['B11']
            }
        },
        diff: {
            process_id: 'normalized_difference',
            arguments: {
                band1: {
                    from_node: 'green'
                },
                band2: {
                    from_node: 'swir'
                }
            }
        },
        reduce: {
            process_id: 'reduce',
            arguments: {
                data: {
                    from_node: 'diff'
                },
                reducer: {
                    callback: {
                        min: {
                            arguments: {
                                data: {
                                    from_argument: 'data'
                                }
                            },
                            process_id: 'mean',
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
                                inputMin: -1,
                                inputMax: 1,
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
                format: 'PNG'
            },
            result: true
        }
    };
}
