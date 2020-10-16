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
import { DataProviderState } from './data-provider.state';
import { DataProviderService } from './data-provider.service';
import {
    AddDataProvider,
    AuthenticateDataProvider,
    LoadDataProviders,
    QuickConnectSelectedDataProvider,
    RemoveDataProvider,
    SelectDataProvider,
    SetCollectionForSelectedDataProvider,
    SignOutDataProvider,
    ToggleDataProvider
} from './data-provider.actions';
import { DataProvider } from './data-provider';
import { take } from 'rxjs/operators';

describe('DataProviderState', () => {
    let store: Store;
    let dataProvidersMock: DataProvider[];
    let dataProviderServiceMock: any;

    beforeEach(async () => {
        dataProvidersMock = [];
        for (let i = 0; i < 4; i++) {
            const dataProvider = new DataProvider();
            dataProvider.name = 'Data Provider ' + i;
            dataProvider.url = 'https://data-provider-' + i + '.com/api';
            dataProvider.isDefault = i === 0;
            dataProvider.isActive = i === 0;
            dataProvider.isPublic = i === 0;
            dataProvider.isAvailable = i === 0;
            dataProvidersMock.push(dataProvider);
        }

        dataProviderServiceMock = {
            getCombinedDataProviders: () => {
                return dataProvidersMock;
            },
            saveDataProviders: () => {
                return;
            },
            toggleActive: (provider: DataProvider) => {
                provider.isActive = !provider.isActive;

                return provider;
            },
            connectProvider: async () => {
                return {};
            },
            authenticate: async provider => {
                provider.connection = {};

                return provider;
            }
        };

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([DataProviderState])],
            providers: [
                {
                    provide: DataProviderService,
                    useValue: dataProviderServiceMock
                }
            ]
        });

        store = TestBed.get(Store);
        await store.dispatch(new LoadDataProviders());
    });

    it('should be initialised', done => {
        const initialised = store.selectSnapshot(
            DataProviderState.isInitialized
        );
        expect(initialised).toBe(true);

        done();
    });

    it('should load data providers', done => {
        const dataProviders = store.selectSnapshot(DataProviderState.getAll);
        expect(dataProviders.length).toBe(4);
        dataProviders.forEach((provider, index) => {
            expect(provider).toEqual(dataProvidersMock[index]);
        });

        done();
    });

    it('should select only active', done => {
        const dataProviders = store.selectSnapshot(DataProviderState.getActive);
        expect(dataProviders.length).toBe(1);
        expect(dataProviders[0]).toEqual(dataProvidersMock[0]);

        done();
    });

    it('action ToggleDataProvider should toggle active', async done => {
        const previous = store.selectSnapshot(
            state => state.dataProvider.dataProviders[2]
        );
        expect(previous.isActive).toBe(false);

        await store
            .dispatch(new ToggleDataProvider(dataProvidersMock[2].url))
            .toPromise();
        const active = store.selectSnapshot(
            state => state.dataProvider.dataProviders[2]
        );
        expect(active.isActive).toBe(true);

        await store
            .dispatch(new ToggleDataProvider(dataProvidersMock[2].url))
            .toPromise();
        const inactive = store.selectSnapshot(
            state => state.dataProvider.dataProviders[2]
        );
        expect(inactive.isActive).toBe(false);

        done();
    });

    it('action SetCollectionForSelectedDataProvider', async done => {
        const collectionName = 'TEST_COLLECTION';
        const previousSnapshot = store.snapshot();
        store.reset({
            ...previousSnapshot,
            dataProvider: {
                ...previousSnapshot.dataProvider,
                selected: dataProvidersMock[2]
            }
        });

        const before = store.selectSnapshot(state => state.dataProvider);
        expect(before.selected.collectionId).toBe('');
        expect(before.dataProviders[2].collectionId).toBe('');

        await store
            .dispatch(new SetCollectionForSelectedDataProvider(collectionName))
            .toPromise();
        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.selected.collectionId).toBe(collectionName);
        expect(after.dataProviders[2].collectionId).toBe(collectionName);

        done();
    });

    it('action selectDataProvider', async done => {
        const before = store.selectSnapshot(state => state.dataProvider);
        expect(before.selected).toBe(null);

        await store
            .dispatch(new SelectDataProvider(dataProvidersMock[0]))
            .toPromise();
        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.selected).toBe(dataProvidersMock[0]);

        done();
    });

    it('action QuickConnectSelectedDataProvider', async done => {
        const service = TestBed.get(DataProviderService);
        spyOn(service, 'connectProvider').and.callThrough();

        await store
            .dispatch(
                new QuickConnectSelectedDataProvider(dataProvidersMock[0])
            )
            .toPromise();

        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.selected.connection).toBeDefined();
        expect(after.selected.url).toBe(dataProvidersMock[0].url);
        expect(service.connectProvider).toHaveBeenCalled();

        done();
    });

    it('action AuthenticateDataProvider', async done => {
        const service = TestBed.get(DataProviderService);
        spyOn(service, 'authenticate').and.callThrough();

        await store
            .dispatch(new AuthenticateDataProvider(dataProvidersMock[0]))
            .toPromise();

        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.dataProviders[0].url).toBe(dataProvidersMock[0].url);
        expect(after.dataProviders[0].connection).toBeDefined();
        expect(after.selected).toBeNull();
        expect(service.authenticate).toHaveBeenCalled();

        done();
    });

    it('action AddDataProvider', async done => {
        const service = TestBed.get(DataProviderService);
        spyOn(service, 'saveDataProviders').and.callThrough();

        const provider = new DataProvider();
        provider.name = 'Data Provider New';
        provider.url = 'https://data-provider-new.com/api';
        provider.isDefault = false;
        provider.isActive = false;
        provider.isPublic = false;
        provider.isAvailable = false;

        await store.dispatch(new AddDataProvider(provider)).toPromise();

        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.dataProviders.length).toBe(5);
        expect(after.dataProviders[4]).toEqual(provider);
        expect(service.saveDataProviders).toHaveBeenCalled();

        done();
    });

    it('action RemoveDataProvider', async done => {
        const service = TestBed.get(DataProviderService);
        spyOn(service, 'saveDataProviders').and.callThrough();

        await store
            .dispatch(new RemoveDataProvider(dataProvidersMock[0]))
            .toPromise();

        const after = store.selectSnapshot(state => state.dataProvider);
        expect(after.dataProviders.length).toBe(3);
        for (let i = 0; i < after.dataProviders.length; i++) {
            expect(after.dataProviders[i].url).not.toBe(
                dataProvidersMock[0].url
            );
        }
        expect(service.saveDataProviders).toHaveBeenCalled();

        done();
    });

    it('action SignOutDataProvider', async done => {
        const service = TestBed.get(DataProviderService);
        spyOn(service, 'saveDataProviders').and.callThrough();

        const provider = new DataProvider();
        provider.name = 'Data Provider Connected';
        provider.url = 'https://data-provider-connected.com/api';
        provider.connection = { some: 'connection' };
        provider.isDefault = false;
        provider.isActive = true;
        provider.isPublic = false;
        provider.isAvailable = true;

        const previousSnapshot = store.snapshot();
        previousSnapshot.dataProvider.dataProviders.push(provider);
        store.reset({
            ...previousSnapshot,
            dataProvider: {
                ...previousSnapshot.dataProvider,
                selected: provider
            }
        });

        await store.dispatch(new SignOutDataProvider(provider)).toPromise();

        const after = store.selectSnapshot(state => state.dataProvider);

        expect(after.dataProviders.length).toBe(5);
        expect(after.dataProviders[4].url).toBe(provider.url);
        expect(after.dataProviders[4].connection).toBeNull();
        expect(after.dataProviders[4].isActive).toBeFalsy();
        expect(after.dataProviders[4].isAvailable).toBeFalsy();

        expect(service.saveDataProviders).toHaveBeenCalled();

        done();
    });
});
