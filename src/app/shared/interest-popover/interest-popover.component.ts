import { Component, Input, OnInit } from '@angular/core';
import { Interest } from '../../core/interest/interest';
import { Store } from '@ngxs/store';
import { SelectInterest } from '../../core/interest/interest.actions';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-interest-popover',
    templateUrl: './interest-popover.component.html',
    styleUrls: ['./interest-popover.component.scss']
})
export class InterestPopoverComponent {
    @Input()
    public interests: Interest[];

    public constructor(
        private store: Store,
        private popoverController: PopoverController
    ) {}

    public async onSelectInterest(event) {
        await this.store.dispatch(new SelectInterest(event.osmLocation.osmId));
        await this.popoverController.dismiss();
    }
}
