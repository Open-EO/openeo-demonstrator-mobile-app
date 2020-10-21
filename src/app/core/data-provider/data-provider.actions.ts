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

import { DataProvider } from './data-provider';

export class LoadDataProviders {
    static readonly type = '[DataProviders] Load';
    constructor() {}
}

export class ToggleDataProvider {
    static readonly type = '[DataProviders] Toggle';
    constructor(public providerUrl: string) {}
}

export class SelectDataProvider {
    static readonly type = '[DataProviders] Select';
    constructor(public provider: DataProvider) {}
}

export class QuickConnectSelectedDataProvider {
    static readonly type = '[DataProviders] Quick Connect Selected';
    constructor(public provider: DataProvider) {}
}

export class AuthenticateDataProvider {
    static readonly type = '[DataProviders] Authenticate';
    constructor(public provider: DataProvider) {}
}

export class AddDataProvider {
    static readonly type = '[DataProviders] Add';
    constructor(public provider: DataProvider) {}
}

export class SaveDataProviders {
    static readonly type = '[DataProviders] Save';
    constructor() {}
}

export class SignOutDataProvider {
    static readonly type = '[DataProvider] Sign out';
    constructor(public provider: DataProvider) {}
}

export class RemoveDataProvider {
    static readonly type = '[DataProvider] Remove';
    constructor(public provider: DataProvider) {}
}

export class SetCollectionForSelectedDataProvider {
    static readonly type = '[DataProvider] Set collection for selected';
    constructor(public collection: string) {}
}

export class SetBandsForProvider {
    static readonly type = '[DataProvider] Set bands for provider';
    constructor(public bands: any, public providerUrl: string) {}
}
