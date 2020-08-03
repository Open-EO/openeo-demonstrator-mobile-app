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

    @Input()
    public set canvas(value) {
        if (this.imageEntity !== null) {
            this.cesiumViewer.entities.remove(this.imageEntity);
        }

        if (!value || !this._interest) {
            return;
        }

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
                    image: value,
                    transparent: true
                })
            }
        });
    }

    @Input()
    public set interest(value: Interest) {
        if (value && value.osmLocation && value.osmLocation.geoJson) {
            this._interest = value;
            this.geoJson = value.osmLocation.geoJson;
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

    private geoJson: any;
    private geoJsonDataSource: any;
    private cesiumViewer: any;
    private _interest: Interest;
    private imageEntity: any = null;

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
}
