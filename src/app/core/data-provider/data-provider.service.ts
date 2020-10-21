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

import { Injectable } from '@angular/core';
import { AuthType, DataProvider } from './data-provider';
import { Connection, OpenEO, BasicProvider } from '@openeo/js-client';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EnvironmentService } from '../environment/environment.service';
import { Storage } from '@ionic/storage';
import { sortBy, unionBy, find } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class DataProviderService {
    private static readonly STORAGE_KEY = 'dataProviders';

    constructor(
        private http: HttpClient,
        private storage: Storage,
        private environment: EnvironmentService
    ) {}

    private async getDefaultProviders(): Promise<DataProvider[]> {
        const dataProviders = [];

        const servers = this.environment.openEO.servers;
        for (const value of servers) {
            const dataProvider = new DataProvider();
            dataProvider.name = value.name;
            dataProvider.url = value.url;
            dataProvider.collectionId = value.collectionId;
            dataProvider.isDefault = true;
            dataProvider.isPublic = value.public;
            dataProvider.isActive = value.public;
            dataProvider.isAvailable = value.public;
            if (value.authType) {
                dataProvider.authType = value.authType;
            }
            if (value.authData) {
                dataProvider.authData = value.authData;
            }
            if (value.bands) {
                dataProvider.bands = value.bands;
            }
            dataProviders.push(dataProvider);
        }

        return dataProviders;
    }

    private async getHubProviders(): Promise<DataProvider[]> {
        const providers = [];
        const backends = await this.http
            .get<HttpResponse<any>>(
                this.environment.openEO.hub + '/backends?details=clipped'
            )
            .toPromise();

        for (const key in backends) {
            if (backends.hasOwnProperty(key)) {
                const version =
                    backends[key].api_version || backends[key].version;
                if (version && this.checkVersion(version)) {
                    const provider = new DataProvider();
                    provider.name = backends[key].backendTitle;
                    provider.url = backends[key].backendUrl;
                    providers.push(provider);
                }
            }
        }

        return providers;
    }

    /**
     * The list of data providers in the app is a combination of 3 sources:
     *   - the default providers from the environment files
     *   - the providers loaded from the openEO Hub
     *   - custom providers and previously used providers from any of the other two sources
     *
     * This action loads the data providers from all three sources and combines
     * them to the final list shown and used in the app.
     */
    public async getCombinedDataProviders(): Promise<DataProvider[]> {
        const defaultProviders = await this.getDefaultProviders();
        const loadedProviders: DataProvider[] = await this.storage.get(
            DataProviderService.STORAGE_KEY
        );
        const hubProviders: DataProvider[] = await this.getHubProviders();

        const providers = sortBy(
            unionBy(loadedProviders, defaultProviders, hubProviders, 'url'),
            provider => provider.name
        );

        for (let i = 0; i < providers.length; i++) {
            if (providers[i].isActive && providers[i].authData) {
                providers[i].connection = await this.connectProvider(
                    providers[i]
                );
            }
        }

        return providers;
    }

    public async saveDataProviders(dataProviders: DataProvider[]) {
        const cleanedDataProviders = [];
        for (const dataProvider of dataProviders) {
            const cleanProvider = { ...dataProvider };
            cleanProvider.connection = null;
            if (!cleanProvider.isDefault) {
                cleanProvider.authData = null;
            }
            cleanedDataProviders.push(cleanProvider);
        }

        await this.storage.set(
            DataProviderService.STORAGE_KEY,
            cleanedDataProviders
        );
    }

    public async toggleActive(provider: DataProvider) {
        if (provider.isAvailable === false) {
            return;
        }

        provider.isActive = !provider.isActive;
        if (provider.isActive) {
            provider.connection = await this.connectProvider(provider);
        } else {
            provider.connection = null;
        }

        return provider;
    }

    public async authenticate(provider: DataProvider): Promise<DataProvider> {
        const connection = await this.connectProvider(provider);
        if (connection !== null) {
            const connectedProvider = { ...provider };
            connectedProvider.connection = connection;
            connectedProvider.isAvailable = true;
            connectedProvider.isActive = true;

            return connectedProvider;
        }

        return provider;
    }

    public async connectProvider(provider: DataProvider): Promise<Connection> {
        const connection = await OpenEO.connect(provider.url);
        const authProviders = await connection.listAuthProviders();

        switch (provider.authType) {
            case AuthType.Basic:
                const basicAuthProvider = find(
                    authProviders,
                    authProvider => authProvider instanceof BasicProvider
                );
                await basicAuthProvider.login(
                    provider.authData.username,
                    provider.authData.password
                );
                break;
            case AuthType.OIDC:
                // TODO: OIDC Authentication
                // const oidcAuthProvider = find(authProviders, (authProvider) => (authProvider instanceof BasicProvider));
                // await oidcAuthProvider.login();

                await connection.authenticateOIDC(provider.authData.token);
                break;
        }

        return connection;
    }

    private checkVersion(versionString: string): boolean {
        const version = versionString.split('.').map(x => parseInt(x, 10));
        const expected = this.environment.openEO.version
            .split('.')
            .map(x => parseInt(x, 10));

        while (version.length < expected.length) {
            version.push(0);
        }

        for (let i = 0; i < version.length; i++) {
            if (version[i] < expected[i]) {
                return false;
            }
        }

        return true;
    }
}
