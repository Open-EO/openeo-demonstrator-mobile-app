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
import * as d3 from 'd3';

export class EOIndex {
    public key: string;

    public get title(): string {
        return environment.openEO.indices[this.key].title;
    }

    public get description(): string {
        return environment.openEO.indices[this.key].description;
    }

    public get processGraph(): any {
        return environment.openEO.indices[this.key].processGraph;
    }

    public get colorScale(): any {
        return environment.openEO.indices[this.key].colorScale;
    }

    constructor(key: string) {
        this.key = key;
    }

    /**
     * Generates a D3js color scale using the colors and steps defined for the index in the
     * environment files. The color scale can then be used to map a value in the domain
     * (usually 0-255) to an RGB value to color the results.
     */
    public generateScale(): any {
        const max = Math.max(...this.colorScale.domain);
        const domain = [];
        for (const step of this.colorScale.steps) {
            domain.push(max * step);
        }

        return d3
            .scaleLinear<string>()
            .domain(domain)
            .range(this.colorScale.colors);
    }
}
