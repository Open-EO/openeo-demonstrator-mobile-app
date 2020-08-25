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

import { BoundingBox } from '../open-eo/bounding-box';
import simplify from 'simplify-js';

export class OpenstreetmapLocation {
    private static readonly SIMPLIFICATION_PRECISION_FACTOR = 0.000001;

    public osmId: number;
    public name: string;
    public nameEn: string;
    public adminLevel: number;
    public latitude: number;
    public longitude: number;
    public geoJson: any;
    public region: string;
    public latitudeMin: number;
    public latitudeMax: number;
    public longitudeMin: number;
    public longitudeMax: number;
    public get boundingBox(): BoundingBox {
        return new BoundingBox(
            this.latitudeMax,
            this.latitudeMin,
            this.longitudeMax,
            this.longitudeMin
        );
    }

    constructor(data: any) {
        if (
            data.geoJson &&
            (typeof data.geoJson === 'string' || data.geoJson instanceof String)
        ) {
            data.geoJson = JSON.parse(data.geoJson);
            if (data.geoJson.coordinates) {
                data.geoJson.coordinates = this.simplify(
                    data.geoJson.coordinates
                );
            }
        } else {
            data.geoJson = null;
        }

        Object.assign(this, data);
    }

    private simplify(polygon: any): any {
        if (
            Array.isArray(polygon) &&
            Array.isArray(polygon[0]) &&
            !Array.isArray(polygon[0][0])
        ) {
            const precision =
                polygon.length *
                OpenstreetmapLocation.SIMPLIFICATION_PRECISION_FACTOR;
            const oldPolygon = polygon;
            if (polygon.length > 30) {
                polygon = polygon.map(item => {
                    return { x: item[0], y: item[1] };
                });
                polygon = simplify(polygon, precision).map(item => {
                    return [item.x, item.y];
                });
            }
            if (polygon.length < 4) {
                console.warn(
                    'Simplified polygon less than 4 points, reverting to original polygon.'
                );
                polygon = oldPolygon;
            }
        } else {
            polygon = polygon.map(item => this.simplify(item));
        }

        return polygon;
    }
}
