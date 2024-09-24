/* @flow strict-local */
import * as NavigationService from '../nav/NavigationService';
import type { PerAccountAction, AllAccountsAction, GlobalThunkAction, Identity } from '../types';
import {
  ACCOUNT_SWITCH,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  DISMISS_SERVER_PUSH_SETUP_NOTICE,
  SET_SILENCE_SERVER_PUSH_SETUP_WARNINGS,
  DISMISS_SERVER_NOTIFS_EXPIRING_BANNER,
} from '../actionConstants';
import { registerAndStartPolling } from '../events/eventActions';
import { resetToMainTabs } from '../nav/navActions';
import { sendOutbox } from '../outbox/outboxActions';
import { initNotifications } from '../notification/notifTokens';
import { resetAccountData } from './logoutActions';

export const dismissServerPushSetupNotice = (): PerAccountAction => ({
  type: DISMISS_SERVER_PUSH_SETUP_NOTICE,

  // We don't compute this in a reducer function. Those should be pure
  // functions of their params:
  //   https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#rules-of-reducers
  date: new Date(),
});

export const dismissServerNotifsExpiringBanner = (): PerAccountAction => ({
  type: DISMISS_SERVER_NOTIFS_EXPIRING_BANNER,

  // We don't compute this in a reducer function. Those should be pure
  // functions of their params:
  //   https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#rules-of-reducers
  date: new Date(),
});

export const setSilenceServerPushSetupWarnings = (value: boolean): PerAccountAction => ({
  type: SET_SILENCE_SERVER_PUSH_SETUP_WARNINGS,
  value,
});

const accountSwitchPlain = (identity: Identity): AllAccountsAction => ({
  type: ACCOUNT_SWITCH,
  identity,
});

export const accountSwitch =
  (identity: Identity): GlobalThunkAction<Promise<void>> =>
  async (dispatch, getState, { activeAccountDispatch }) => {
    NavigationService.dispatch(resetToMainTabs());

    // Clear out the space we use for the active account's server data, to
    // make way for a new active account.
    // TODO(#5006): When each account has its own space to hold server data,
    //   we won't have to do this.
    activeAccountDispatch(resetAccountData());

    dispatch(accountSwitchPlain(identity));

    // Now dispatch some actions on the new, post-switch active account.
    // Because we just dispatched `accountSwitchPlain`, that new account
    // is now the active account, so `activeAccountDispatch` will act on it.

    await activeAccountDispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    activeAccountDispatch(sendOutbox());

    activeAccountDispatch(initNotifications());
  };

export const removeAccount = (identity: Identity): AllAccountsAction => ({
  type: ACCOUNT_REMOVE,
  identity,
});

const loginSuccessPlain = (realm: URL, email: string, apiKey: string): AllAccountsAction => ({
  type: LOGIN_SUCCESS,
  realm,
  email,
  apiKey,
});

export const loginSuccess =
  (realm: URL, email: string, apiKey: string): GlobalThunkAction<Promise<void>> =>
  async (dispatch, getState, { activeAccountDispatch }) => {
    NavigationService.dispatch(resetToMainTabs());

    // In case there's already an active account, clear out the space we use
    // for the active account's server data, to make way for a new active
    // account.
    // TODO(#5006): When each account has its own space to hold server data,
    //   we won't have to do this.
    activeAccountDispatch(resetAccountData());

    dispatch(loginSuccessPlain(realm, email, apiKey));

    // Now dispatch some actions on the new, post-login active account.
    // Because we just dispatched `loginSuccessPlain`, that new account is
    // now the active account, so `activeAccountDispatch` will act on it.

    await activeAccountDispatch(registerAndStartPolling());

    // TODO(#3881): Lots of issues with outbox sending
    activeAccountDispatch(sendOutbox());

    activeAccountDispatch(initNotifications());
  };
