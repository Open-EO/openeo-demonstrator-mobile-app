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
import { Bands } from '../../app/core/data-provider/bands';

export function ndsi(
    collection: string,
    startDate: Date,
    endDate: Date,
    boundingBox: BoundingBox,
    geoJson: any,
    bands: Bands
): any {
    return {
        process_graph: {
            dc: {
                process_id: 'load_collection',
                arguments: {
                    id: collection,
                    spatial_extent: geoJson,
                    temporal_extent: [
                        formatDate(startDate, 'yyyy-MM-dd', 'en'),
                        formatDate(endDate, 'yyyy-MM-dd', 'en')
                    ],
                    bands: [bands.green, bands.swir1]
                }
            },
            diff: {
                process_id: 'reduce_dimension',
                arguments: {
                    data: {
                        from_node: 'dc'
                    },
                    reducer: {
                        process_graph: {
                            b3: {
                                process_id: 'array_element',
                                arguments: {
                                    data: {
                                        from_parameter: 'data'
                                    },
                                    label: 'B3'
                                }
                            },
                            b11: {
                                process_id: 'array_element',
                                arguments: {
                                    data: {
                                        from_parameter: 'data'
                                    },
                                    label: 'B11'
                                }
                            },
                            diff: {
                                process_id: 'normalized_difference',
                                arguments: {
                                    x: {
                                        from_node: 'b3'
                                    },
                                    y: {
                                        from_node: 'b11'
                                    }
                                },
                                result: true
                            }
                        }
                    },
                    dimension: 'bands'
                }
            },
            reduce: {
                process_id: 'reduce_dimension',
                arguments: {
                    data: {
                        from_node: 'diff'
                    },
                    reducer: {
                        process_graph: {
                            min: {
                                arguments: {
                                    data: {
                                        from_parameter: 'data'
                                    }
                                },
                                process_id: 'mean',
                                result: true
                            }
                        }
                    },
                    dimension: 't'
                }
            },
            scale: {
                process_id: 'apply',
                arguments: {
                    data: {
                        from_node: 'reduce'
                    },
                    process: {
                        process_graph: {
                            lsr: {
                                arguments: {
                                    x: {
                                        from_parameter: 'x'
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
        }
    };
}
