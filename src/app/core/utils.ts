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

export const EARTH_RADIUS_METERS = 6378 * 1000;

/**
 * Get the date of today at midnight (all time properties set to 0).
 */
export function dateOfTodayWithoutTime(): Date {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Check if a number is within a given range. If it's higher, it will be set to
 * the minimum of the range, if it's lower it's set to the maximum. Therefore
 * "rotating" through the range.
 *
 * @param number
 * @param min
 * @param max
 */
export function rotatingClamp(
    number: number,
    min: number,
    max: number
): number {
    if (number > max) {
        number = min;
    } else if (number < min) {
        number = max;
    }

    return number;
}

/**
 * Convert degrees to radians.
 *
 * @param degrees
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance of two points on the same latitude using the Haversine formula.
 *
 * @param minLongitude
 * @param maxLongitude
 * @param latitude
 */
export function distanceLongitude(
    minLongitude: number,
    maxLongitude: number,
    latitude: number
): number {
    const radians = {
        latitude: degToRad(latitude),
        maxLong: degToRad(maxLongitude),
        minLong: degToRad(minLongitude)
    };
    const diffLong = Math.abs(radians.maxLong - radians.minLong);
    const temp =
        Math.pow(Math.cos(radians.latitude), 2) *
        Math.pow(Math.sin(diffLong / 2), 2);

    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(temp));
}

/**
 * Calculates the distance of two points on the same longitude using the Haversine formula.
 *
 * @param minLatitude
 * @param maxLatitude
 */
export function distanceLatitude(
    minLatitude: number,
    maxLatitude: number
): number {
    const radians = {
        maxLat: degToRad(maxLatitude),
        minLat: degToRad(minLatitude)
    };
    const diffLat = Math.abs(radians.maxLat - radians.minLat);

    return 2 * EARTH_RADIUS_METERS * (diffLat / 2);
}
