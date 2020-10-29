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
import { DataProvider } from '../../app/core/data-provider/data-provider';

export enum Bands {
    BLUE = 'blue',
    GREEN = 'green',
    RED = 'red',
    NIR = 'nir',
    SWIR1 = 'swir1',
    SWIR2 = 'swir2',
    TCIR = 'tcir',
    TCIG = 'tcig',
    TCIB = 'tcib'
}

export function loadCollection(
    dataProvider: DataProvider,
    startDate: Date,
    endDate: Date,
    boundingBox: BoundingBox,
    geoJson: any,
    bandNames: string[]
): any {
    const bands = [];
    bandNames.forEach(bandName => {
        bands.push(dataProvider.bands[bandName]);
    });

    const process = {
        process_id: 'load_collection',
        arguments: {
            id: dataProvider.collectionId,
            spatial_extent: {
                west: boundingBox.minLongitude,
                south: boundingBox.minLatitude,
                east: boundingBox.maxLongitude,
                north: boundingBox.maxLatitude
            },
            temporal_extent: [
                formatDate(startDate, 'yyyy-MM-dd', 'en'),
                formatDate(endDate, 'yyyy-MM-dd', 'en')
            ],
            bands: bands
        }
    };

    if (dataProvider.useGeoJSON !== false) {
        process.arguments.spatial_extent = geoJson;
    }

    return process;
}

export function reduceTemporal(dataNode: string = 'dc') {
    return {
        process_id: 'reduce_dimension',
        arguments: {
            data: {
                from_node: dataNode
            },
            reducer: {
                process_graph: {
                    min: {
                        arguments: {
                            data: {
                                from_parameter: 'data'
                            }
                        },
                        process_id: 'min',
                        result: true
                    }
                }
            },
            dimension: 't'
        }
    };
}

export function save(
    dataProvider: DataProvider,
    bands: string[] = [],
    dataNode: string = 'scale'
) {
    const process: any = {
        process_id: 'save_result',
        arguments: {
            data: {
                from_node: dataNode
            },
            format: 'PNG'
        },
        result: true
    };

    if (bands.length > 0) {
        process.arguments.options = {
            red: dataProvider.bands[bands[0]],
            green: dataProvider.bands[bands[1]],
            blue: dataProvider.bands[bands[2]]
        };
    }

    return process;
}

export function scale(
    dataProvider: DataProvider,
    dataNode: string = 'reduce',
    min = -1,
    max: number | string = 1
) {
    const process: any = {
        process_id: 'apply',
        arguments: {
            data: {
                from_node: dataNode
            },
            process: {
                process_graph: {
                    lsr: {
                        arguments: {
                            x: {
                                from_parameter: 'x'
                            },
                            inputMin: min,
                            inputMax: max,
                            outputMin: 0,
                            outputMax: 255
                        },
                        process_id: 'linear_scale_range',
                        result: true
                    }
                }
            }
        }
    };

    if (dataProvider.useLinearScaling === false) {
        process.arguments.process.process_graph = scaleSubstitution(
            min,
            max,
            0,
            255
        );
    }

    return process;
}

export function scaleSubstitution(inputMin, inputMax, outputMin, outputMax) {
    return {
        add: {
            arguments: {
                x: {
                    from_node: 'multiply'
                },
                y: outputMin
            },
            process_id: 'add',
            result: true
        },
        divide: {
            arguments: {
                x: {
                    from_node: 'subtract1'
                },
                y: {
                    from_node: 'subtract2'
                }
            },
            process_id: 'divide'
        },
        multiply: {
            arguments: {
                x: {
                    from_node: 'divide'
                },
                y: {
                    from_node: 'subtract3'
                }
            },
            process_id: 'multiply'
        },
        subtract1: {
            arguments: {
                x: {
                    from_parameter: 'x'
                },
                y: inputMin
            },
            process_id: 'subtract'
        },
        subtract2: {
            arguments: {
                x: inputMax,
                y: inputMin
            },
            process_id: 'subtract'
        },
        subtract3: {
            arguments: {
                x: outputMax,
                y: outputMin
            },
            process_id: 'subtract'
        }
    };
}
