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

import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Connection } from '@openeo/js-client';
import { DataProviderState } from '../data-provider/data-provider.state';
import { Store } from '@ngxs/store';
import { EOIndex } from './eo-index';
import {
    dateOfTodayWithoutTime,
    distanceLatitude,
    distanceLongitude
} from '../utils';
import { OpenstreetmapLocation } from '../openstreetmap/openstreetmap-location';
import { IndexData } from './index-data';
import { CacheIndexData } from '../interest/interest.actions';
import * as d3 from 'd3';
import { CustomMessageError } from '../error/custom-message-error';

@Injectable({
    providedIn: 'root'
})
export class OpenEOService {
    private renderer: Renderer2;

    constructor(
        private store: Store,
        private rendererFactory: RendererFactory2
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    public async validateProcessGraph(
        connection: Connection,
        processGraph: any
    ): Promise<any[]> {
        return await connection.validateProcess(processGraph);
    }

    public async compute(
        connection: Connection,
        processGraph: any
    ): Promise<any> {
        return connection.computeResult(processGraph, 'free', 100);
    }

    public async loadIndexData(
        index: EOIndex,
        location: OpenstreetmapLocation,
        cache: Map<string, any>
    ): Promise<IndexData> {
        const dataProviders = this.store.selectSnapshot(
            DataProviderState.getActive
        );

        if (!dataProviders || !index || !location) {
            return null;
        }

        const endDate = dateOfTodayWithoutTime();
        const startDate = dateOfTodayWithoutTime();
        startDate.setDate(endDate.getDate() - 10);

        const distanceLong = distanceLongitude(
            location.boundingBox.minLongitude,
            location.boundingBox.maxLongitude,
            Math.max(
                Math.abs(location.boundingBox.minLatitude),
                Math.abs(location.boundingBox.maxLatitude)
            )
        );
        const distanceLat = distanceLatitude(
            location.boundingBox.minLatitude,
            location.boundingBox.maxLatitude
        );
        const resolution = Math.round(
            Math.min(distanceLong / 1000, distanceLat / 1000)
        );

        // TODO: figure out which dataset to use for the selected backend(s)

        const indexData = new IndexData(index, location, startDate, endDate);

        if (cache.has(indexData.cacheId)) {
            return cache.get(indexData.cacheId);
        }

        let dataProviderToUse = null;
        let processGraph = null;

        for (let i = 0; i < dataProviders.length; i++) {
            if (!dataProviders[i].collectionId) {
                continue;
            }

            processGraph = index.processGraph(
                dataProviders[i].collectionId,
                startDate,
                endDate,
                location.boundingBox,
                JSON.parse(location.geoJson),
                resolution
            );

            const errors = await this.validateProcessGraph(
                dataProviders[i].connection,
                processGraph
            );

            if (errors.length === 0) {
                dataProviderToUse = dataProviders[i];
                break;
            } else {
                console.warn([
                    'Invalid process graph',
                    dataProviders[i],
                    processGraph,
                    errors
                ]);
            }
        }

        if (dataProviderToUse !== null && processGraph !== null) {
            indexData.data = await this.compute(
                dataProviderToUse.connection,
                processGraph
            );
            indexData.canvas = await this.blobToRaster(index, indexData.data);
            this.store.dispatch(new CacheIndexData(indexData));
        } else {
            throw new CustomMessageError(
                'No provider was able to process the request. Please make sure you have selected a collection in the settings.'
            );
        }

        return indexData;
    }

    public async blobToRaster(index: EOIndex, data: Blob): Promise<any> {
        const canvas: HTMLCanvasElement = this.renderer.createElement('canvas');

        const objectUrl = URL.createObjectURL(data);
        const image = new Image();

        const promise = new Promise<any>((resolve, reject) => {
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;

                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);

                if (index.colorScale) {
                    const coloredImageData = this.colorize(
                        index,
                        context.getImageData(0, 0, canvas.width, canvas.height)
                    );
                    context.putImageData(coloredImageData, 0, 0);
                }

                resolve(canvas);
            };
            image.onerror = error => {
                console.error(error);
                reject();
            };
        });

        image.src = objectUrl;

        return promise;
    }

    public colorize(index: EOIndex, imageData: ImageData) {
        const max = Math.max(...index.colorScale.domain);
        const scale = index.generateScale();

        for (let i = 0; i < imageData.data.length; i = i + 4) {
            if (imageData.data[i + 3] > 0) {
                const value = imageData.data[i];
                const rgb = d3.rgb(scale(value));

                imageData.data[i] = rgb.r;
                imageData.data[i + 1] = rgb.g;
                imageData.data[i + 2] = rgb.b;
                imageData.data[i + 3] = 255;
            }
        }

        return imageData;
    }
}
