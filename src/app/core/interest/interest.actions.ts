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

import { IndexData } from '../open-eo/index-data';

export class LoadInterests {
    static readonly type = '[Interests] Load';
    constructor() {}
}

export class FavoriseInterest {
    static readonly type = '[Interests] Favorise';
    constructor(public osmId: number, public isFavorite: boolean) {}
}

export class SelectInterest {
    static readonly type = '[Interests] Select';
    constructor(public osmId: number) {}
}

export class NextIndex {
    static readonly type = '[Interests] Next EO Index';
    constructor() {}
}

export class PreviousIndex {
    static readonly type = '[Interests] Previous EO Index';
    constructor() {}
}

export class LoadCurrentIndexData {
    static readonly type = '[Interests] Load Current EO Index Data';
}

export class CacheIndexData {
    static readonly type = '[Interests] Cache Index Data';

    constructor(public data: IndexData) {}
}

export class UpdateRetrievalDate {
    static readonly type = '[Interests] Update Retrieval Date';

    constructor(public retrievalDate: Date) {}
}

export class UpdateRetrievalTimespan {
    static readonly type = '[Interests] Update Retrieval Timespan';

    constructor(public retrievalTimespan: number) {}
}
