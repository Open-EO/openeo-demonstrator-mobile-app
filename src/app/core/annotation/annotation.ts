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

import { Interest } from '../interest/interest';
import { EOIndex } from '../open-eo/eo-index';
import CryptoJS from 'crypto-js';

export class Annotation {
    public key: string;
    public title: string;
    public description: string;
    public osmId: number;
    public retrievalDate: Date;
    public retrievalStartDate: Date;
    public retvievalTimespan: number;
    public imageDataUrl: string;
    public eoIndexKey: string;

    constructor(data: any) {
        Object.assign(this, data);
    }

    public getKey(): string {
        return CryptoJS.MD5(
            this.osmId +
                this.eoIndexKey +
                this.retrievalStartDate.toISOString() +
                this.retvievalTimespan
        ).toString();
    }
}
