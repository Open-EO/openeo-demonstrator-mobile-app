import { EnvironmentInterface } from './environment-interface';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EnvironmentService implements EnvironmentInterface {
    get colorScales(): any {
        return environment.colorScales;
    }

    get openEO(): any {
        return environment.openEO;
    }

    get openstreetmap(): any {
        return environment.openstreetmap;
    }

    get production(): boolean {
        return environment.production;
    }

    get proj4(): any {
        return environment.proj4;
    }
}
