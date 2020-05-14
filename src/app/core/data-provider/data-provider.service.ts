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
import { environment } from '../../../environments/environment';
import { Connection, OpenEO } from '@openeo/js-client';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DataProviderService {
    constructor(private http: HttpClient) {}

    public async getDefaultProviders(): Promise<DataProvider[]> {
        const dataProviders = [];

        const servers = environment.openEO.servers;
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
            dataProviders.push(dataProvider);
        }

        return dataProviders;
    }

    public async getHubProviders(): Promise<DataProvider[]> {
        const providers = [];
        const backends = await this.http
            .get<HttpResponse<any>>(
                environment.openEO.hub + '/backends?details=clipped'
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
        let connection;

        connection = await OpenEO.connect(provider.url);

        switch (provider.authType) {
            case AuthType.Basic:
                await connection.authenticateBasic(
                    provider.authData.username,
                    provider.authData.password
                );
                break;
            case AuthType.OIDC:
                await connection.authenticateOIDC(provider.authData.token);
                break;
        }

        return connection;
    }

    private checkVersion(versionString: string): boolean {
        const version = versionString.split('.').map(x => parseInt(x, 10));
        const expected = environment.openEO.version
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
