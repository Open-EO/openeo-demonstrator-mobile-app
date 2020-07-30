import { environment } from '../../../environments/environment';
import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { DataProviderService } from './data-provider.service';
import { EnvironmentService } from '../environment/environment.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthType } from './data-provider';
import { AuthData } from '../open-eo/auth-data';

describe('DataProviderService', () => {
    describe('checkVersion()', () => {
        const mockEnvironment = environment;
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

        // let httpClient: HttpClient;
        let httpTestingController: HttpTestingController;

        beforeEach(async () => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                providers: [
                    DataProviderService,
                    { provide: EnvironmentService, useValue: mockEnvironment }
                ]
            });

            // httpClient = TestBed.get(HttpClient);
            httpTestingController = TestBed.get(HttpTestingController);
        });

        it('returns only data providers supporting any version equal or higher than configured in the environment', fakeAsync(() => {
            const response = [
                {
                    backendTitle: 'Backend 1',
                    api_version: '1.0.0-rc.2',
                    backendUrl: 'https://backend-1/v1.0'
                },
                {
                    backendTitle: 'Backend 2',
                    api_version: '0.4.2',
                    backendUrl: 'https://backend-2/v0.4'
                }
            ];

            const service = TestBed.get(DataProviderService);
            service.getHubProviders().then(providers => {
                expect(providers.length).toBe(1);
                expect(providers[0].url).toBe('https://backend-1/v1.0');
            });
            const request = httpTestingController.expectOne(
                'http://localhost/hub/api/backends?details=clipped'
            );
            request.flush(response);

            tick();
        }));

        it('returns the data provider data from the Hub', fakeAsync(() => {
            const response = [
                {
                    backendTitle: 'Backend 1',
                    api_version: '1.0.0-rc.2',
                    backendUrl: 'https://backend-1/v1.0'
                },
                {
                    backendTitle: 'Backend 2',
                    api_version: '0.4.2',
                    backendUrl: 'https://backend-2/v0.4'
                }
            ];

            const service = TestBed.get(DataProviderService);
            service.getHubProviders().then(providers => {
                expect(providers.length).toBe(1);
                expect(providers[0].name).toBe('Backend 1');
                expect(providers[0].url).toBe('https://backend-1/v1.0');
            });
            const request = httpTestingController.expectOne(
                'http://localhost/hub/api/backends?details=clipped'
            );
            request.flush(response);

            tick();
        }));

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
                expect(providers[0].authType).toBe(AuthType.Basic);
                expect(providers[0].authData.username).toBe('user');
                expect(providers[0].authData.password).toBe('password');
                expect(providers[0].authData.token).toBe('token');
            });
        }));
    });
});
