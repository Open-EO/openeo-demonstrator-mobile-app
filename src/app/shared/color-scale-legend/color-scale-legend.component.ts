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

import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild
} from '@angular/core';
import { EOIndex } from '../../core/open-eo/eo-index';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { Platform } from '@ionic/angular';
import { InterestState } from '../../core/interest/interest.state';
import * as d3 from 'd3';

@Component({
    selector: 'app-color-scale-legend',
    templateUrl: './color-scale-legend.component.html',
    styleUrls: ['./color-scale-legend.component.scss']
})
export class ColorScaleLegendComponent implements OnInit, OnDestroy {
    private readonly LEGEND_PERCENTAGE_HEIGHT = 30;
    private readonly LEGEND_WIDTH = 100;
    private readonly MARKER_WIDTH = 15;
    private readonly MARKER_COLOR = '#ffffff';
    private readonly MARKER_LINE_WIDTH = 1;
    private readonly MARKER_FONT = '11px Arial';
    private readonly SCALE_WIDTH = 10;
    private readonly SCALE_MAX_VALUE = 255;
    private readonly SCALE_MARGIN = 10;

    @ViewChild('colorLegendCanvas', { static: true })
    public colorLegendElement: ElementRef;
    public index: EOIndex = null;

    private subscription: Subscription;
    private canvas: HTMLCanvasElement = null;

    constructor(
        private renderer: Renderer2,
        private store: Store,
        private platform: Platform
    ) {}

    public ngOnInit(): void {
        this.subscription = this.store
            .select(InterestState.getCurrentIndex)
            .subscribe((index: EOIndex) => {
                this.index = index;
                this.render();
            });
        if (this.colorLegendElement) {
            this.canvas = this.colorLegendElement.nativeElement;
            this.resizeCanvas();
        }
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private resizeCanvas() {
        this.canvas.height =
            this.platform.height() * (this.LEGEND_PERCENTAGE_HEIGHT / 100);
        this.canvas.width = this.LEGEND_WIDTH;
    }

    private render(): void {
        if (!this.canvas) {
            return;
        }

        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.canvas && this.index && this.index.colorScale) {
            context.drawImage(this.renderScale(), 0, this.SCALE_MARGIN);
            this.renderMarkers(context);
        }
    }

    private renderScale(): HTMLCanvasElement {
        const scaleCanvas = this.renderer.createElement('canvas');
        const scaleHeight = this.canvas.height - 2 * this.SCALE_MARGIN;
        scaleCanvas.width = this.SCALE_WIDTH;
        scaleCanvas.height = scaleHeight;

        const max = Math.max(...this.index.colorScale.domain);
        const scale = this.index.generateScale();
        const context = scaleCanvas.getContext('2d');
        const imageData = context.getImageData(
            0,
            0,
            this.SCALE_WIDTH,
            scaleHeight
        );

        for (let y = 0; y < scaleHeight; y++) {
            let value = (y / scaleHeight) * this.SCALE_MAX_VALUE;
            if (this.index.colorScale.inverted === true) {
                value = max - value;
            }
            const rgb = d3.rgb(scale(value));

            for (let x = 0; x < this.SCALE_WIDTH; x++) {
                const i = y * this.SCALE_WIDTH * 4 + x * 4;
                imageData.data[i] = rgb.r;
                imageData.data[i + 1] = rgb.g;
                imageData.data[i + 2] = rgb.b;
                imageData.data[i + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);

        return scaleCanvas;
    }

    private buildScaleData(): number[] {
        const height = this.canvas.height;
        const data = new Array(this.SCALE_WIDTH * height);
        for (let y = 0; y < height; y++) {
            const value = (y / height) * this.SCALE_MAX_VALUE;
            for (let x = 0; x < this.SCALE_WIDTH; x++) {
                data[y * this.SCALE_WIDTH + x] = value;
            }
        }

        return data;
    }

    private renderMarkers(context: CanvasRenderingContext2D) {
        if (!this.index.colorScale.markers) {
            return;
        }

        const scaleHeight = this.canvas.height - 2 * this.SCALE_MARGIN;

        context.beginPath();
        context.lineWidth = this.MARKER_LINE_WIDTH;
        context.strokeStyle = this.MARKER_COLOR;
        context.textBaseline = 'middle';
        context.font = this.MARKER_FONT;

        for (const marker of this.index.colorScale.markers) {
            const y = scaleHeight * marker.position + this.SCALE_MARGIN + 0.5;
            context.moveTo(0, y);
            context.lineTo(this.MARKER_WIDTH, y);
            context.strokeText(marker.value, this.MARKER_WIDTH + 5, y);
        }
        context.stroke();
    }
}
