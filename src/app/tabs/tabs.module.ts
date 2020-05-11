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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TabsPage } from './tabs.page';
import { DataProviderSelectedGuard } from '../core/data-provider/data-provider-selected.guard';
import { DataProviderSelectedAndConnectedGuard } from '../core/data-provider/data-provider-selected-and-connected.guard';

const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'home',
                loadChildren: '../home/home.module#HomePageModule'
            },
            {
                path: 'recent-locations',
                loadChildren:
                    '../recent-locations/recent-locations.module#RecentLocationsPageModule'
            },
            {
                path: 'favorite-locations',
                loadChildren:
                    '../favorite-locations/favorite-locations.module#FavoriteLocationsPageModule'
            },
            {
                path: 'open-eo',
                children: [
                    {
                        path: '',
                        loadChildren:
                            '../open-eo/info/open-eo.module#OpenEOPageModule'
                    },
                    {
                        path: 'provider-info',
                        canActivate: [DataProviderSelectedGuard],
                        children: [
                            {
                                path: '',
                                loadChildren:
                                    '../open-eo/provider-info/provider-info.module#ProviderInfoPageModule'
                            },
                            {
                                path: 'capabilities',
                                loadChildren:
                                    '../open-eo/capabilities/capabilities.module#CapabilitiesPageModule'
                            },
                            {
                                path: 'collections',
                                canActivate: [
                                    DataProviderSelectedAndConnectedGuard
                                ],
                                children: [
                                    {
                                        path: '',
                                        loadChildren:
                                            '../open-eo/collections/collections.module#CollectionsPageModule'
                                    },
                                    {
                                        path: 'detail',
                                        loadChildren:
                                            '../open-eo/collections-detail/collections-detail.module#CollectionsDetailPageModule'
                                    }
                                ]
                            },
                            {
                                path: 'file-types',
                                loadChildren:
                                    '../open-eo/file-types/file-types.module#FileTypesPageModule',
                                canActivate: [
                                    DataProviderSelectedAndConnectedGuard
                                ]
                            },
                            {
                                path: 'processes',
                                loadChildren:
                                    '../open-eo/processes/processes.module#ProcessesPageModule',
                                canActivate: [
                                    DataProviderSelectedAndConnectedGuard
                                ]
                            },
                            {
                                path: 'jobs',
                                loadChildren:
                                    '../open-eo/jobs/jobs.module#JobsPageModule',
                                canActivate: [
                                    DataProviderSelectedAndConnectedGuard
                                ]
                            }
                        ]
                    },
                    {
                        path: 'authenticate',
                        canActivate: [DataProviderSelectedGuard],
                        loadChildren:
                            '../open-eo/authenticate/authenticate.module#AuthenticatePageModule'
                    },
                    {
                        path: 'add-provider',
                        loadChildren:
                            '../open-eo/add-provider/add-provider.module#AddProviderPageModule'
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [TabsPage]
})
export class TabsPageModule {}
