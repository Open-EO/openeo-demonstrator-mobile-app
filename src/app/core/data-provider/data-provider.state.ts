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

import { DataProviderStateModel } from './data-provider.state';
import {
    AddDataProvider,
    AuthenticateDataProvider,
    LoadDataProviders,
    QuickConnectSelectedDataProvider,
    RemoveDataProvider,
    SaveDataProviders,
    SelectDataProvider,
    SetCollectionForSelectedDataProvider,
    SignOutDataProvider,
    ToggleDataProvider
} from './data-provider.actions';
import { DataProvider } from './data-provider';
import { State, Action, StateContext, Selector, NgxsOnInit } from '@ngxs/store';
import { DataProviderService } from './data-provider.service';
import { Navigate } from '@ngxs/router-plugin';
import { InvalidateCurrentIndexData } from '../interest/interest.actions';
import { AuthenticationError } from '../error/authentication-error';

export interface DataProviderStateModel {
    dataProviders: DataProvider[];
    selected: DataProvider;
    initialized: boolean;
}

@State<DataProviderStateModel>({
    name: 'dataProvider',
    defaults: {
        dataProviders: [],
        selected: null,
        initialized: false
    }
})
export class DataProviderState {
    constructor(private service: DataProviderService) {}

    @Selector()
    public static getAll(state: DataProviderStateModel) {
        return state.dataProviders;
    }

    @Selector()
    public static getAvailable(state: DataProviderStateModel) {
        return state.dataProviders.filter(
            (item: DataProvider) => item.isAvailable
        );
    }

    @Selector()
    public static getActive(state: DataProviderStateModel) {
        return state.dataProviders.filter(
            (item: DataProvider) => item.isActive
        );
    }

    @Selector()
    public static getNeedAuthenticating(state: DataProviderStateModel) {
        return state.dataProviders.filter(
            (item: DataProvider) =>
                item.isActive && !item.connection && !item.authData
        );
    }

    @Selector()
    public static getSelected(state: DataProviderStateModel) {
        return state.selected;
    }

    @Selector()
    public static isInitialized(state: DataProviderStateModel) {
        return state.initialized;
    }

    @Action(LoadDataProviders)
    public async loadDataProviders(ctx: StateContext<DataProviderStateModel>) {
        const providers = await this.service.getCombinedDataProviders();

        ctx.patchState({
            dataProviders: providers,
            initialized: true
        });
        ctx.dispatch(new InvalidateCurrentIndexData());
    }

    @Action(SaveDataProviders)
    public async saveDataProviders(ctx: StateContext<DataProviderStateModel>) {
        await this.service.saveDataProviders(ctx.getState().dataProviders);
    }

    @Action(ToggleDataProvider)
    public async toggleDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: ToggleDataProvider
    ) {
        const newDataProviders = [];
        const dataProviders = ctx.getState().dataProviders;
        for (let i = 0; i < dataProviders.length; i++) {
            newDataProviders.push(dataProviders[i]);
            if (newDataProviders[i].url === action.providerUrl) {
                newDataProviders[i] = await this.service.toggleActive({
                    ...dataProviders[i]
                });
            }
        }

        ctx.patchState({
            dataProviders: newDataProviders
        });
        ctx.dispatch(new SaveDataProviders());
        ctx.dispatch(new InvalidateCurrentIndexData());
    }

    @Action(SetCollectionForSelectedDataProvider)
    public setCollectionForSelectedDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: SetCollectionForSelectedDataProvider
    ) {
        const selected = { ...ctx.getState().selected };
        selected.collectionId = action.collection;

        const dataProviders = Array.from(ctx.getState().dataProviders);
        for (let i = 0; i < dataProviders.length; i++) {
            if (dataProviders[i].url === selected.url) {
                dataProviders[i] = selected;
            }
        }

        ctx.patchState({
            dataProviders: dataProviders,
            selected: selected
        });
        ctx.dispatch(new SaveDataProviders());
        ctx.dispatch(new InvalidateCurrentIndexData());
    }

    @Action(SelectDataProvider)
    public async selectDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: SelectDataProvider
    ) {
        ctx.patchState({
            selected: action.provider
        });
    }

    @Action(QuickConnectSelectedDataProvider)
    public async quickConnectSelectedDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: SelectDataProvider
    ) {
        const provider = { ...action.provider };
        provider.connection = await this.service.connectProvider(provider);
        ctx.patchState({ selected: provider });
    }

    @Action(AuthenticateDataProvider)
    public async authenticateDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: AuthenticateDataProvider
    ) {
        // TODO: Check if OIDC works properly
        try {
            const provider = await this.service.authenticate(action.provider);
            if (provider.connection !== null) {
                const dataProviders = Array.from(ctx.getState().dataProviders);
                for (let i = 0; i < dataProviders.length; i++) {
                    if (dataProviders[i].url === provider.url) {
                        dataProviders[i] = provider;
                    }
                }

                let selected = ctx.getState().selected;
                if (selected && selected.url === provider.url) {
                    selected = provider;
                }

                ctx.patchState({
                    dataProviders: dataProviders,
                    selected: selected
                });
                ctx.dispatch(new SaveDataProviders());
            }
        } catch (e) {
            throw new AuthenticationError();
        }
    }

    @Action(AddDataProvider)
    public async addDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: AddDataProvider
    ) {
        const state = ctx.getState();
        state.dataProviders.push(action.provider);
        ctx.patchState({
            dataProviders: state.dataProviders
        });
        ctx.dispatch(new SaveDataProviders());
    }

    @Action(RemoveDataProvider)
    public async RemoveDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: RemoveDataProvider
    ) {
        const providers = ctx
            .getState()
            .dataProviders.filter(
                (value: DataProvider) => value.url !== action.provider.url
            );

        ctx.patchState({
            dataProviders: providers
        });
        ctx.dispatch(new SaveDataProviders());
        ctx.dispatch(new Navigate(['/tabs/open-eo']));
    }

    @Action(SignOutDataProvider)
    public async SignOutDataProvider(
        ctx: StateContext<DataProviderStateModel>,
        action: SignOutDataProvider
    ) {
        const providers = Array.from(ctx.getState().dataProviders);
        for (let i = 0; i < providers.length; i++) {
            if (providers[i].url === action.provider.url) {
                if (
                    providers[i].isAvailable === true &&
                    providers[i].isPublic === false
                ) {
                    const provider = { ...providers[i] };
                    provider.connection = null;
                    provider.isAvailable = false;
                    provider.isActive = false;
                    providers[i] = provider;
                }

                break;
            }
        }

        let selected = ctx.getState().selected;
        if (ctx.getState().selected.url === action.provider.url) {
            selected = { ...ctx.getState().selected };
            selected.connection = null;
            selected.isActive = false;
            selected.isAvailable = false;
        }

        ctx.patchState({
            dataProviders: providers,
            selected: selected
        });
        ctx.dispatch(new SaveDataProviders());
        ctx.dispatch(new Navigate(['/tabs/open-eo']));
    }
}
