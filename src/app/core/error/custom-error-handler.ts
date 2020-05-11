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

import { Injectable, ErrorHandler } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CustomMessageError } from './custom-message-error';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
    constructor(private toastController: ToastController) {}

    public async handleError(wrappedError: any) {
        // see: https://github.com/angular/angular/issues/27840
        const error = wrappedError.rejection
            ? wrappedError.rejection
            : wrappedError;

        let message =
            'Unfortunately an unknown error has occurred. Please restart the app and try again.';
        if (error instanceof CustomMessageError) {
            message = error.message;
        }
        if (error instanceof HttpErrorResponse) {
            if (error.status >= 500 && error.status < 600) {
                message =
                    'The server returned an unexpected answer (' +
                    error.status +
                    '). Please try again later.';
            } else if (error.status >= 400 && error.status < 500) {
                message =
                    'The request failed (' +
                    error.status +
                    ', ' +
                    error.statusText +
                    '). Please check your inputs and try again.';
            } else {
                message =
                    'There was a problem talking to the remote service. ' +
                    'Please check your internet connection and try again.';
            }
        }

        const toast = await this.toastController.create({
            message: message,
            duration: 2000
        });
        await toast.present();

        if (false === environment.production) {
            throw error;
        }
    }
}
