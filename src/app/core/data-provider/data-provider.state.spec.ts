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
    LoadDataProviders,
    SetCollectionForSelectedDataProvider,
    ToggleDataProvider
} from './data-provider.actions';
import { DataProvider } from './data-provider';
import { take } from 'rxjs/operators';

describe('DataProviderState', () => {
    let store: Store;
    let dataProvidersMock: DataProvider[];
    let dataProviderServiceMock: any;

    beforeEach(() => {
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
    });

    it('should be initialised', done => {
        const actions$ = TestBed.get(Actions);
        actions$
            .pipe(ofActionCompleted(LoadDataProviders))
            .pipe(take(1))
            .subscribe(() => {
                const initialised = store.selectSnapshot(
                    DataProviderState.isInitialized
                );
                expect(initialised).toBe(true);

                done();
            });
    });

    it('should load data providers', done => {
        const actions$ = TestBed.get(Actions);
        actions$
            .pipe(ofActionCompleted(LoadDataProviders))
            .pipe(take(1))
            .subscribe(() => {
                const dataProviders = store.selectSnapshot(
                    DataProviderState.getAll
                );
                expect(dataProviders.length).toBe(4);
                dataProviders.forEach((provider, index) => {
                    expect(provider).toEqual(dataProvidersMock[index]);
                });

                done();
            });
    });

    it('should select only active', done => {
        const actions$ = TestBed.get(Actions);
        actions$
            .pipe(ofActionCompleted(LoadDataProviders))
            .pipe(take(1))
            .subscribe(() => {
                const dataProviders = store.selectSnapshot(
                    DataProviderState.getActive
                );
                expect(dataProviders.length).toBe(1);
                expect(dataProviders[0]).toEqual(dataProvidersMock[0]);

                done();
            });
    });

    it('action ToggleDataProvider should toggle active', async done => {
        const actions$ = TestBed.get(Actions);
        actions$
            .pipe(ofActionCompleted(LoadDataProviders))
            .pipe(take(1))
            .subscribe(async () => {
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
    });

    it('action SetCollectionForSelectedDataProvider sets collection', async done => {
        const collectionName = 'TEST_COLLECTION';
        const actions$ = TestBed.get(Actions);
        actions$
            .pipe(ofActionCompleted(LoadDataProviders))
            .pipe(take(1))
            .subscribe(async () => {
                const previousSnapshot = store.snapshot();
                store.reset({
                    ...previousSnapshot,
                    dataProvider: {
                        ...previousSnapshot.dataProvider,
                        selected: dataProvidersMock[2]
                    }
                });

                const before = store.selectSnapshot(
                    state => state.dataProvider
                );
                expect(before.selected.collectionId).toBe('');
                expect(before.dataProviders[2].collectionId).toBe('');

                await store
                    .dispatch(
                        new SetCollectionForSelectedDataProvider(collectionName)
                    )
                    .toPromise();
                const after = store.selectSnapshot(state => state.dataProvider);
                expect(after.selected.collectionId).toBe(collectionName);
                expect(after.dataProviders[2].collectionId).toBe(
                    collectionName
                );

                done();
            });
    });
});
