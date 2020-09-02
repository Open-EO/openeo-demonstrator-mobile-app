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

import { OpenstreetmapLocation } from '../openstreetmap/openstreetmap-location';
import { Interest } from './interest';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { SelectInterest } from './interest.actions';
import { Geoposition } from '@ionic-native/geolocation/ngx';
import { Store } from '@ngxs/store';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController } from '@ionic/angular';
import { CustomMessageError } from '../error/custom-message-error';

@Injectable({
    providedIn: 'root'
})
export class InterestService {
    private host = environment.openstreetmap.geobackend;

    constructor(
        private http: HttpClient,
        private store: Store,
        private geolocation: Geolocation,
        private diagnostic: Diagnostic,
        private alertController: AlertController
    ) {}

    public search(query: string): Promise<Interest[]> {
        if (!query || query.length < 3) {
            throw new CustomMessageError(
                'Please enter at least 3 characters to search'
            );
        }

        return this.http
            .get<HttpResponse<string>[]>(this.host + 'search?keyword=' + query)
            .pipe(
                map((results: HttpResponse<string>[]) =>
                    results.map(
                        data => new Interest(new OpenstreetmapLocation(data))
                    )
                )
            )
            .toPromise();
    }

    public reverseGeocode(
        latitude: number,
        longitude: number
    ): Promise<Interest[]> {
        return this.http
            .get<HttpResponse<string>[]>(
                this.host + 'reverse?lat=' + latitude + '&long=' + longitude
            )
            .pipe(
                map((results: HttpResponse<string>[]) =>
                    results.map(
                        data => new Interest(new OpenstreetmapLocation(data))
                    )
                )
            )
            .toPromise();
    }

    public getLocation(id: number): Promise<Interest> {
        return this.http
            .get(this.host + 'location/' + id)
            .pipe(
                map(
                    (data: HttpResponse<string>) =>
                        new Interest(new OpenstreetmapLocation(data))
                )
            )
            .toPromise();
    }

    public async getInterestForGPS() {
        try {
            const geoposition: Geoposition = await this.geolocation.getCurrentPosition(
                { enableHighAccuracy: true }
            );
            const possibleInterests = await this.reverseGeocode(
                geoposition.coords.latitude,
                geoposition.coords.longitude
            );

            if (possibleInterests.length > 0) {
                this.store.dispatch(
                    new SelectInterest(possibleInterests[0].osmLocation.osmId)
                );
            }
        } catch (e) {
            if (e.code && e.code === e.PERMISSION_DENIED) {
                console.error(
                    'Permission to location services has been denied.'
                );
            } else {
                throw e;
            }
        }
    }

    public async askForLocationService() {
        const alert = await this.alertController.create({
            header: 'Enable location?',
            message:
                "Would you like to enable the phone's location services to show your current position on the map?",
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Enable',
                    handler: () => {
                        this.diagnostic.switchToLocationSettings();
                    }
                }
            ]
        });

        await alert.present();
    }

    public async checkForLocation() {
        const isLocationEnabled = await this.diagnostic.isLocationEnabled();

        if (isLocationEnabled === true) {
            await this.getInterestForGPS();
        } else {
            await this.askForLocationService();
        }
    }
}
