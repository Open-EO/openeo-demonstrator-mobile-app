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

import { environment } from '../../../environments/environment';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DataProviderService } from './data-provider.service';
import { EnvironmentService } from '../environment/environment.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { AuthType } from './data-provider';
import { AuthData } from '../open-eo/auth-data';
import { Storage } from '@ionic/storage';

describe('DataProviderService', () => {
    const mockEnvironment = { ...environment };
    mockEnvironment.openEO = {
        version: '1.0.0',
        hub: 'http://localhost/hub/api',
        servers: [
            {
                name: 'Default Backend',
                url: 'https://default/',
                collectionId: 'SENTINEL_2',
                public: true,
                authType: AuthType.Basic,
                authData: new AuthData('user', 'password', 'token')
            }
        ]
    };

    const mockHubResponse = [
        {
            backendTitle: 'Backend 1',
            api_version: '1.0.0-rc.2',
            backendUrl: 'https://backend-1/v1.0'
        },
        {
            backendTitle: 'Default Backend On The Hub',
            api_version: '1.0.0-rc.2',
            backendUrl: 'https://default/'
        },
        {
            backendTitle: 'Backend 2',
            api_version: '0.4.2',
            backendUrl: 'https://backend-2/v0.4'
        }
    ];

    const mockStorage = {
        get: () => {
            return [];
        },
        set: (key, data) => {
            return;
        }
    };

    let httpTestingController: HttpTestingController;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                DataProviderService,
                { provide: Storage, useValue: mockStorage },
                { provide: EnvironmentService, useValue: mockEnvironment }
            ]
        });

        httpTestingController = TestBed.get(HttpTestingController);
    });

    describe('checkVersion()', () => {
        it('returns only data providers supporting any version equal or higher than configured in the environment', fakeAsync(() => {
            const service = TestBed.get(DataProviderService);
            service.getHubProviders().then(providers => {
                expect(providers.length).toBe(2);
                expect(providers[0].url).toBe('https://backend-1/v1.0');
                expect(providers[1].url).toBe('https://default/');
            });
            const request = httpTestingController.expectOne(
                'http://localhost/hub/api/backends?details=clipped'
            );
            request.flush(mockHubResponse);

            tick();
        }));
    });

    describe('getHubProviders', () => {
        it('returns the data provider data from the Hub with the correct version', fakeAsync(() => {
            const service = TestBed.get(DataProviderService);
            service.getHubProviders().then(providers => {
                expect(providers.length).toBe(2);
                expect(providers[0].name).toBe('Backend 1');
                expect(providers[0].url).toBe('https://backend-1/v1.0');
                expect(providers[1].url).toBe('https://default/');
            });

            const request = httpTestingController.expectOne(
                'http://localhost/hub/api/backends?details=clipped'
            );
            request.flush(mockHubResponse);

            tick();
        }));
    });

    describe('getDefaultProviders', () => {
        it('loads default server from the environment configuration', fakeAsync(() => {
            const service = TestBed.get(DataProviderService);
            service.getDefaultProviders().then(providers => {
                expect(providers.length).toBe(1);
                expect(providers[0].name).toBe('Default Backend');
                expect(providers[0].url).toBe('https://default/');
                expect(providers[0].collectionId).toBe('SENTINEL_2');
                expect(providers[0].isPublic).toBe(true);
                expect(providers[0].isAvailable).toBe(true);
                expect(providers[0].isActive).toBe(true);
                expect(providers[0].isDefault).toBe(true);
                expect(providers[0].authType).toBe(AuthType.Basic);
                expect(providers[0].authData.username).toBe('user');
                expect(providers[0].authData.password).toBe('password');
                expect(providers[0].authData.token).toBe('token');
            });
        }));
    });

    describe('getCombinedDataProviders', () => {
        it('sets the default data provider merged with the ones from the hub', fakeAsync(() => {
            const service = TestBed.get(DataProviderService);

            const connectSpy = spyOn(service, 'connectProvider').and.callFake(
                provider => {
                    return provider;
                }
            );

            service.getCombinedDataProviders().then(providers => {
                expect(providers.length).toBe(2);
                expect(providers[0].name).toBe('Backend 1');
                expect(providers[1].name).toBe(
                    mockEnvironment.openEO.servers[0].name
                );
                expect(providers[1].isDefault).toBe(true);
                expect(providers[1].authData).toBe(
                    mockEnvironment.openEO.servers[0].authData
                );
                expect(providers[1].authType).toBe(
                    mockEnvironment.openEO.servers[0].authType
                );
                expect(providers[1].collectionId).toBe(
                    mockEnvironment.openEO.servers[0].collectionId
                );
            });

            tick();

            const request = httpTestingController.expectOne(
                'http://localhost/hub/api/backends?details=clipped'
            );
            request.flush(mockHubResponse);

            tick();

            expect(connectSpy).toHaveBeenCalled();
        }));
    });
});
