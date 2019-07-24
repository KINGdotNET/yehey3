import { createAsyncActionType } from '../helpers/stateHelpers';
import { getAccountWithFollowingCount } from '../helpers/apiHelpers';

export const GET_ACCOUNT = createAsyncActionType('@users/GET_ACCOUNT');

export const getAccount = name => dispatch =>
  dispatch({
    type: GET_ACCOUNT.ACTION,
    payload: getAccountWithFollowingCount(name),
    meta: { username: name },
  }).catch(() => {});
