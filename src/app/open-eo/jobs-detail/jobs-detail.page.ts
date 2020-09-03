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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { DataProviderState } from '../../core/data-provider/data-provider.state';
import { Observable, Subscription } from 'rxjs';
import { DataProvider } from '../../core/data-provider/data-provider';

@Component({
    selector: 'app-jobs-detail',
    templateUrl: './jobs-detail.page.html',
    styleUrls: ['./jobs-detail.page.scss']
})
export class JobsDetailPage implements OnInit, OnDestroy {
    @Select(DataProviderState.getSelected)
    public provider$: Observable<DataProvider>;
    public job: any;
    public jobResults: any;
    public logs: { level: string; message: string }[] = [];
    private endSyncFn = null;
    private jobId: string;
    private providerSubscription: Subscription;

    public constructor(private router: Router) {}

    public ngOnInit() {
        this.jobId = this.router.getCurrentNavigation().extras.state.jobId;

        this.providerSubscription = this.provider$.subscribe(
            async (value: DataProvider) => {
                this.job = await value.connection.getJob(this.jobId);
                this.endSyncFn = this.job.monitorJob(async (job, logs) => {
                    this.job = job;
                    this.logs = logs;
                    if (this.job.status === 'finished') {
                        this.jobResults = await this.job.listResults();
                    }
                    console.log('ahsjdkhjkasd0');
                }, 3);
            }
        );
    }

    public ngOnDestroy() {
        this.providerSubscription.unsubscribe();
        this.endSyncFn();
    }
}
