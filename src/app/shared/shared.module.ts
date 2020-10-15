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

import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterestSearchComponent } from './interest-search/interest-search.component';
import { InterestListItemComponent } from './interest-list-item/interest-list-item.component';
import { MapComponent } from './map/map.component';
import { IndexSliderComponent } from './index-slider/index-slider.component';
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { CodeComponent } from './code/code.component';
import { ServersPopoverComponent } from './servers-popover/servers-popover.component';
import { RouterModule } from '@angular/router';
import { ColorScaleLegendComponent } from './color-scale-legend/color-scale-legend.component';
import { InterestPopoverComponent } from './interest-popover/interest-popover.component';
import { HomeActionsPopoverComponent } from './home-actions-popover/home-actions-popover.component';
import { AnnotationListItemComponent } from './annotation-list-item/annotation-list-item.component';
import { AuthenticateComponent } from './authenticate/authenticate.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        InterestSearchComponent,
        InterestListItemComponent,
        AnnotationListItemComponent,
        MapComponent,
        IndexSliderComponent,
        LoadingIndicatorComponent,
        CodeComponent,
        ServersPopoverComponent,
        InterestPopoverComponent,
        HomeActionsPopoverComponent,
        ColorScaleLegendComponent,
        AuthenticateComponent
    ],
    imports: [CommonModule, RouterModule, FormsModule, IonicModule],
    entryComponents: [
        ServersPopoverComponent,
        InterestPopoverComponent,
        HomeActionsPopoverComponent,
        AuthenticateComponent
    ],
    exports: [
        CommonModule,
        InterestSearchComponent,
        InterestListItemComponent,
        AnnotationListItemComponent,
        MapComponent,
        IndexSliderComponent,
        LoadingIndicatorComponent,
        CodeComponent,
        ServersPopoverComponent,
        InterestPopoverComponent,
        HomeActionsPopoverComponent,
        ColorScaleLegendComponent,
        AuthenticateComponent
    ]
})
export class SharedModule {}
