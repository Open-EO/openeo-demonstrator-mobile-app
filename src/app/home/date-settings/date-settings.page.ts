import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { InterestState } from '../../core/interest/interest.state';
import {
    UpdateRetrievalDate,
    UpdateRetrievalTimespan
} from '../../core/interest/interest.actions';

@Component({
    selector: 'app-date-settings',
    templateUrl: './date-settings.page.html'
})
export class DateSettingsPage implements OnInit, OnDestroy {
    @Select(InterestState.getRetrievalDate)
    public retrievalDate$: Observable<Date>;
    @Select(InterestState.getRetrievalTimespan)
    public retrievalTimespan$: Observable<number>;
    public retrievalDate: Date;
    public retrievalTimespan: number;
    public maxDate: string;

    private subscriptions: Subscription[] = null;

    constructor(private store: Store) {
        this.maxDate = new Date().toISOString();
    }

    public ngOnInit(): void {
        if (this.subscriptions === null) {
            this.subscriptions = [
                this.retrievalDate$.subscribe(
                    date => (this.retrievalDate = date)
                ),
                this.retrievalTimespan$.subscribe(
                    timespan => (this.retrievalTimespan = timespan)
                )
            ];
        }
    }

    public ngOnDestroy(): void {
        if (this.subscriptions) {
            this.subscriptions.forEach(subscription =>
                subscription.unsubscribe()
            );
        }
        this.subscriptions = null;
    }

    public onChangeDate(event) {
        this.store.dispatch(
            new UpdateRetrievalDate(new Date(event.detail.value))
        );
    }

    public onChangeTimespan(event) {
        this.store.dispatch(new UpdateRetrievalTimespan(event.detail.value));
    }
}
