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

import { Actions, NgxsModule, ofActionCompleted, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { InterestState } from './interest.state';
import { InterestService } from './interest.service';
import { Storage } from '@ionic/storage';
import { OpenEOService } from '../open-eo/open-eo.service';
import {
    FavoriseInterest,
    LoadInterests,
    SelectInterest
} from './interest.actions';
import { Interest } from './interest';
import { environment } from '../../../environments/environment';
import { EnvironmentService } from '../environment/environment.service';

describe('InterestState', () => {
    let store: Store;
    let interestsMock: any[];

    const geoJson = JSON.stringify({
        type: 'Polygon',
        coordinates: [
            [
                [7.56926566943041, 47.43044841749601],
                [7.567760272677281, 47.42486788741891],
                [7.57045962027453, 47.42032030185089],
                [7.57768162600121, 47.41777708806601],
                [7.57960765888614, 47.41580074117329],
                [7.579608823537835, 47.41580056664936],
                [7.57960998818957, 47.41580039212543],
                [7.579612317493041, 47.41580004307757],
                [7.579616976099982, 47.41579934498185],
                [7.5796262933137815, 47.41579794879038],
                [7.5796449277414615, 47.41579515640733],
                [7.58378343256859, 47.41158061676611],
                [7.5877406910582, 47.41156566207061],
                [7.58811582752084, 47.4135566053398],
                [7.603614910275401, 47.41855457409649],
                [7.611730380383661, 47.4232039939073],
                [7.617390305662789, 47.428660483137705],
                [7.607422778933251, 47.43266457934549],
                [7.58490677583138, 47.428623716235194],
                [7.581206884670681, 47.42878068945941],
                [7.58010025007217, 47.4320482150913],
                [7.57321071083215, 47.43641037283351],
                [7.5689061636537, 47.43590859148939],
                [7.56926566943041, 47.43044841749601]
            ]
        ]
    });
    const randomInterestMock = {
        osmLocation: {
            osmId: 9999,
            name: 'Location ' + 9999,
            adminLevel: 4,
            latitude: 43.679216,
            longitude: 7.96235672,
            geoJson: geoJson,
            region: 'Region ' + 9999,
            latitudeMin: 43.677,
            latitudeMax: 43.68,
            longitudeMin: 7.9623,
            longitudeMax: 7.9625
        }
    };

    const environmentMock = environment;
    const interestServiceMock = {
        checkForLocation: async () => null,
        getLocation: async i => {
            if (interestsMock[i]) {
                return new Interest(interestsMock[i]);
            } else {
                return new Interest(randomInterestMock);
            }
        }
    };
    const openEOServiceMock = {};
    const storageMock = {
        get: async () => interestsMock,
        set: async () => null
    };

    beforeEach(() => {
        interestsMock = [];
        for (let i = 0; i < 4; i++) {
            interestsMock.push({
                osmLocation: {
                    osmId: i,
                    name: 'Location ' + i,
                    adminLevel: 4,
                    latitude: 43.679216,
                    longitude: 7.96235672,
                    geoJson: geoJson,
                    region: 'Region ' + i,
                    latitudeMin: 43.677,
                    latitudeMax: 43.68,
                    longitudeMin: 7.9623,
                    longitudeMax: 7.9625
                }
            });
        }

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([InterestState])],
            providers: [
                {
                    provide: InterestService,
                    useValue: interestServiceMock
                },
                {
                    provide: OpenEOService,
                    useValue: openEOServiceMock
                },
                {
                    provide: Storage,
                    useValue: storageMock
                },
                {
                    provide: EnvironmentService,
                    useValue: environmentMock
                }
            ]
        });

        store = TestBed.get(Store);
    });

    it('should be initialised', async done => {
        await store.dispatch(new LoadInterests());
        const interests = store.selectSnapshot(InterestState.getAll);
        expect(interests.length).toBe(interestsMock.length);
        interests.forEach(item => {
            expect(item instanceof Interest).toBeTruthy();
        });

        done();
    });

    it('action FavoriseInterest', async done => {
        await store.dispatch(new LoadInterests());
        TestBed.get(Actions)
            .pipe(ofActionCompleted(LoadInterests))
            .pipe(take(1))
            .subscribe(async () => {
                await store
                    .dispatch(
                        new FavoriseInterest(
                            interestsMock[0].osmLocation.osmId,
                            true
                        )
                    )
                    .toPromise();

                const interests = store.selectSnapshot(InterestState.getAll);

                interests.forEach(item => {
                    if (
                        item.osmLocation.osmId ===
                        interestsMock[0].osmLocation.osmId
                    ) {
                        expect(item.isFavorite).toBeTruthy();
                    } else {
                        expect(item.isFavorite).toBeFalsy();
                    }
                });

                done();
            });
    });

    it('action SelectInterest', async done => {
        await store.dispatch(new LoadInterests());
        const service = TestBed.get(InterestService);
        spyOn(service, 'getLocation').and.callThrough();
        TestBed.get(Actions)
            .pipe(ofActionCompleted(LoadInterests))
            .pipe(take(1))
            .subscribe(async () => {
                await store.dispatch(new SelectInterest(9999)).toPromise();

                const interests = store.selectSnapshot(InterestState.getAll);
                interests.forEach(item => {
                    if (item.osmLocation.osmId === 9999) {
                        expect(item.availableIndices.length).toBeGreaterThan(0);
                    }
                });

                const selected = store.selectSnapshot(
                    InterestState.getSelected
                );
                expect(selected.osmLocation.osmId).toBe(9999);

                expect(service.getLocation).toHaveBeenCalled();

                done();
            });
    });
});
