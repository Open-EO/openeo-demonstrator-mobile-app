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

import { AuthType } from '../app/core/data-provider/data-provider';
import { AuthData } from '../app/core/open-eo/auth-data';
import { ndvi } from './process_graphs/ndvi';
import { ndwi } from './process_graphs/ndwi';
import { ndbi } from './process_graphs/ndbi';
import { ndsi } from './process_graphs/ndsi';
import { agriculture } from './process_graphs/agriculture';
import { trueColor } from './process_graphs/true-color';
import { EnvironmentInterface } from '../app/core/environment/environment-interface';

export const environment: EnvironmentInterface = {
    production: false,
    openEO: {
        hub: 'https://hub.openeo.org/api',
        version: '1.0.0',
        servers: [
            {
                name: 'Google Earth Engine Proxy for openEO',
                url: 'https://earthengine.openeo.org/v1.0',
                collectionId: 'COPERNICUS/S2_SR',
                public: true,
                authType: AuthType.Basic,
                authData: new AuthData('group5', 'test123', ''),
                bands: {
                    blue: 'B2',
                    green: 'B3',
                    red: 'B4',
                    nir: 'B8',
                    swir1: 'B11',
                    swir2: 'B12',
                    tcir: 'TCI_R',
                    tcig: 'TCI_G',
                    tcib: 'TCI_B'
                }
            },
            {
                name: 'VITO Remote Sensing openEO API',
                url: 'https://openeo.vito.be/openeo/1.0',
                collectionId: 'TERRASCOPE_S2_TOC_V2',
                public: true,
                authType: AuthType.Basic,
                authData: new AuthData(
                    'solenix_mobile_app',
                    'solenix_mobile_app123',
                    ''
                ),
                useGeoJSON: false,
                useLinearScaling: false,
                bands: {
                    blue: 'TOC-B02_10M',
                    green: 'TOC-B03_10M',
                    red: 'TOC-B04_10M',
                    nir: 'TOC-B08_10M',
                    swir1: 'TOC-B11_20M',
                    swir2: 'TOC-B12_20M',
                    tcir: 'TOC-B04_10M',
                    tcig: 'TOC-B03_10M',
                    tcib: 'TOC-B02_10M'
                }
            }
        ],
        indices: {
            indexOrder: [
                'trueColor',
                'ndvi',
                'ndsi',
                'agriculture',
                'ndwi',
                'ndbi'
            ],
            ndvi: {
                title: 'Normalized Difference Vegetation Index (NDVI)',
                processGraph: ndvi,
                colorScale: {
                    colors: [
                        '#5591b0',
                        '#9b7653',
                        '#B9AA65',
                        '#C3CD5B',
                        '#546323'
                    ],
                    steps: [0, 0.5, 0.6, 0.8, 1],
                    domain: [0, 255],
                    markers: [
                        {
                            position: 0.0,
                            value: -1.0
                        },
                        {
                            position: 0.6,
                            value: 0.2
                        },
                        {
                            position: 0.5,
                            value: 0
                        },
                        {
                            position: 1.0,
                            value: 1.0
                        }
                    ]
                },
                description:
                    '<p>The Normalized Difference Vegetation Index (NDVI) can be used to identify areas of vegetation and ' +
                    'to determine the health of the vegetation. It is based on the absorption of red and near-infrared light ' +
                    'by plant leaves and defines values between -1.0 and +1.0. Values below 0 are mostly clouds, water ' +
                    'and snow. Values close to 0 are rocks, buildings, sand, etc. while values above about 0.2 are vegetation. ' +
                    'The closer the value is to 1.0, the denser/healthier the vegetation is at that location.</p>'
            },
            ndwi: {
                title: 'Normalized Difference Water Index (NDWI)',
                processGraph: ndwi,
                colorScale: {
                    colors: ['#9b7653', '#b59475', '#bad2df', '#5591b0'],
                    steps: [0, 0.45, 0.55, 0.9],
                    domain: [0, 255],
                    markers: [
                        {
                            position: 0.0,
                            value: -1.0
                        },
                        {
                            position: 0.5,
                            value: 0
                        },
                        {
                            position: 1.0,
                            value: 1.0
                        }
                    ]
                },
                description:
                    '<p>The Normalized Difference Water Index (NDWI) identifies surface moisture and water in plant leaves ' +
                    'based on the green and near-infrared bands. It is therefore a good indicator for drought stress of the ' +
                    'vegetation in a region. As with all normalized difference indices, its value ranges from -1.0 to +1.0 ' +
                    'with values closer to +1.0 meaning more water content and values closer to -1.0 corresponding to dryer ' +
                    'surface.</p>'
            },
            ndsi: {
                title: 'Normalized Difference Snow Index (NDSI)',
                processGraph: ndsi,
                description:
                    '<p>The Normalized Difference Snow Index (NDSI) based on the green and infrared bands makes it easy to ' +
                    "differentiate areas covered in snow and areas without snow. Again, it's values range from -1.0 to " +
                    '+1.0 where values above 0 indicate some level of snow coverage. Note that clouds might also be classified ' +
                    'as snow with this index.</p>',
                colorScale: {
                    colors: ['#2C1910', '#9b7653', '#ff8888', '#ffffff'],
                    steps: [0, 0.5, 0.6, 1],
                    domain: [0, 255],
                    markers: [
                        {
                            position: 0.0,
                            value: -1.0
                        },
                        {
                            position: 0.5,
                            value: 0
                        },
                        {
                            position: 1.0,
                            value: 1.0
                        }
                    ]
                }
            },
            ndbi: {
                title: 'Normalized Difference Built-Up Index (NDBI)',
                processGraph: ndbi,
                description:
                    '<p>Based on the near infrared and short wave infrared bands, the Normalized Difference Build-Up Index ' +
                    '(NDBI) allows to distinguish between rural/natural areas and built-up areas. The values also range from ' +
                    '-1.0 to +1.0 as with all normalized difference indices. The lower end -1.0 represents water bodies, ' +
                    'values around the middle (0) represent vegetation and high values towards +1.0 represent built-up ' +
                    'areas.</p>',
                colorScale: {
                    colors: [
                        '#5591b0',
                        '#bad2df',
                        '#C3CD5B',
                        '#9b7653',
                        '#2C1910'
                    ],
                    steps: [0, 0.4, 0.5, 0.7, 1],
                    domain: [0, 255],
                    markers: [
                        {
                            position: 0.0,
                            value: -1.0
                        },
                        {
                            position: 0.5,
                            value: 0
                        },
                        {
                            position: 1.0,
                            value: 1.0
                        }
                    ]
                }
            },
            agriculture: {
                title: 'Agriculture (False Colour)',
                processGraph: agriculture,
                colorScale: null,
                description:
                    '<p>This representation assigns bands which are usually invisible to the human eye to visible colours ' +
                    'to highlight vegetation and agriculture in the image.</p>'
            },
            trueColor: {
                title: 'True Colour',
                processGraph: trueColor,
                colorScale: null,
                description:
                    '<p> The image as it would be seen by the human eye.'
            }
        }
    },
    colorScales: {
        default: {
            colors: ['#ff0000', '#93b307', '#009c28', '#043611'],
            steps: [0.4, 0.55, 0.65, 0.95]
        }
    },
    proj4: {
        definitions: [
            [
                'EPSG:26771',
                '+proj=tmerc +lat_0=36.66666666666666 +lon_0=-88.33333333333333 +k=0.9999749999999999 +' +
                    'x_0=152400.3048006096 +y_0=0 +ellps=clrk66 +datum=NAD27 +to_meter=0.3048006096012192 +no_defs '
            ],
            ['EPSG:32633', '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs']
        ]
    },
    openstreetmap: {
        geobackend: 'https://geobackend-openeo.solenix.ch/api/v1/',
        admin_levels: {
            1: '',
            2: 'Country',
            3: 'Province',
            4: 'State/Canton',
            5: 'Region',
            6: 'District',
            7: 'Circle',
            8: 'Municipality',
            9: 'Suburb',
            10: 'Quarter'
        }
    }
};
