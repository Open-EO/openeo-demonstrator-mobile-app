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

import { Interest } from '../../core/interest/interest';
import {
    Component,
    ViewChild,
    AfterViewInit,
    Input,
    ElementRef,
    Output,
    EventEmitter
} from '@angular/core';
import { Location } from '../../core/open-eo/location';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
    @Output()
    public longPress: EventEmitter<Location> = new EventEmitter<Location>();

    @ViewChild('cesiumMap', { static: false })
    public cesiumMap: ElementRef;
    public wmtsConfig = {
        url: 'https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml',
        layer: 's2cloudless_3857',
        style: 'default',
        format: 'image/jpeg',
        tileMatrixSetID: 'g',
        maximumLevel: 19
    };
    public cesiumViewer: any;

    @Input()
    public set canvas(value) {
        this._canvas = value;
        this.updateMap();
    }

    @Input()
    public set interest(value: Interest) {
        this._interest = value;
        this.updateMap();
    }

    private geoJson: any;
    private geoJsonDataSource: any;
    private imageEntity: any = null;
    private _interest: Interest;
    private _canvas: any;

    public ngAfterViewInit() {
        this.cesiumViewer = new Cesium.Viewer(this.cesiumMap.nativeElement, {
            selectionIndicator: false,
            timeline: false,
            infoBox: false,
            fullscreenButton: false,
            animation: false,
            shouldAnimate: false,
            homeButton: false,
            geocoder: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            projectionPicker: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            imageryProvider: new Cesium.WebMapTileServiceImageryProvider(
                this.wmtsConfig
            ),
            scene3DOnly: true
        });

        this.cesiumViewer.imageryLayers.add(
            new Cesium.ImageryLayer(
                new Cesium.UrlTemplateImageryProvider({
                    url:
                        'https://stamen-tiles.a.ssl.fastly.net/terrain-labels/{z}/{x}/{y}.png'
                }),
                {
                    alpha: 1,
                    contrast: 1.0
                }
            )
        );

        this.cesiumViewer.scene.screenSpaceCameraController.enableRotate = true;
        this.cesiumViewer.scene.screenSpaceCameraController.enableTilt = false;
        Cesium.CreditDisplay.cesiumCredit = null;
    }

    public onPress(event: any) {
        const ellipsoid = this.cesiumViewer.scene.globe.ellipsoid;
        const cartesian = this.cesiumViewer.camera.pickEllipsoid(
            new Cesium.Cartesian3(
                event.srcEvent.clientX,
                event.srcEvent.clientY,
                ellipsoid
            )
        );

        if (cartesian) {
            const coordinates = ellipsoid.cartesianToCartographic(cartesian);
            this.longPress.emit(
                new Location(
                    Cesium.Math.toDegrees(coordinates.latitude),
                    Cesium.Math.toDegrees(coordinates.longitude)
                )
            );
        }
    }

    private updateMap() {
        if (this.imageEntity !== null) {
            this.cesiumViewer.entities.remove(this.imageEntity);
        }

        if (this._interest) {
            this.updateInterest();

            if (this._canvas) {
                this.updateDataImage();
            }
        }
    }

    private updateDataImage() {
        const boundingBox = this._interest.osmLocation.boundingBox;

        this.imageEntity = this.cesiumViewer.entities.add({
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(
                    boundingBox.minLongitude,
                    boundingBox.minLatitude,
                    boundingBox.maxLongitude,
                    boundingBox.maxLatitude
                ),
                material: new Cesium.ImageMaterialProperty({
                    image: this._canvas,
                    transparent: true
                })
            }
        });
    }

    private updateInterest() {
        if (this._interest.osmLocation && this._interest.osmLocation.geoJson) {
            this.geoJson = this._interest.osmLocation.geoJson;
            Cesium.GeoJsonDataSource.load(this.geoJson, {
                stroke: Cesium.Color.DARKBLUE,
                fill: Cesium.Color.TRANSPARENT,
                strokeWidth: 3
            }).then(dataSource => {
                this.cesiumViewer.dataSources.remove(this.geoJsonDataSource);
                this.geoJsonDataSource = dataSource;
                this.cesiumViewer.dataSources.add(this.geoJsonDataSource);
                this.cesiumViewer.flyTo(this.geoJsonDataSource, {
                    offset: new Cesium.HeadingPitchRange(
                        0,
                        Cesium.Math.toRadians(-90),
                        0
                    )
                });
            });
        }
    }
}
