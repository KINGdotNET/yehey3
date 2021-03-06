import { createAction } from 'redux-actions';
import { getIsAuthenticated, getAuthenticatedUserName } from '../reducers';
import { getAllFollowing, getNetworkUserListFromAPI, getTopFollowedListFromAPI, getAllAccountsFromAPI} from '../helpers/apiHelpers';
import { createAsyncActionType } from '../helpers/stateHelpers';

export const FOLLOW_USER = '@user/FOLLOW_USER';
export const FOLLOW_USER_START = '@user/FOLLOW_USER_START';
export const FOLLOW_USER_SUCCESS = '@user/FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_ERROR = '@user/FOLLOW_USER_ERROR';

export const followUser = username => (dispatch, getState, { weauthjsInstance }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: FOLLOW_USER,
    payload: {
      promise: weauthjsInstance.follow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const UNFOLLOW_USER = '@user/UNFOLLOW_USER';
export const UNFOLLOW_USER_START = '@user/UNFOLLOW_USER_START';
export const UNFOLLOW_USER_SUCCESS = '@user/UNFOLLOW_USER_SUCCESS';
export const UNFOLLOW_USER_ERROR = '@user/UNFOLLOW_USER_ERROR';

export const unfollowUser = username => (dispatch, getState, { weauthjsInstance }) => {
  const state = getState();

  if (!getIsAuthenticated(state)) {
    return Promise.reject('User is not authenticated');
  }

  return dispatch({
    type: UNFOLLOW_USER,
    payload: {
      promise: weauthjsInstance.unfollow(getAuthenticatedUserName(state), username),
    },
    meta: {
      username,
    },
  });
};

export const GET_FOLLOWING = '@user/GET_FOLLOWING';
export const GET_FOLLOWING_START = '@user/GET_FOLLOWING_START';
export const GET_FOLLOWING_SUCCESS = '@user/GET_FOLLOWING_SUCCESS';
export const GET_FOLLOWING_ERROR = '@user/GET_FOLLOWING_ERROR';

export const getFollowing = username => (dispatch, getState) => {
  const state = getState();

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_FOLLOWING_ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  return dispatch({
    type: GET_FOLLOWING,
    meta: targetUsername,
    payload: {
      promise: getAllFollowing(targetUsername),
    },
  });
};

export const UPDATE_RECOMMENDATIONS = '@user/UPDATE_RECOMMENDATIONS';
export const updateRecommendations = createAction(UPDATE_RECOMMENDATIONS);

export const GET_NOTIFICATIONS = createAsyncActionType('@user/GET_NOTIFICATIONS');

export const getNotifications = username => (dispatch, getState, { blockchainLiteAPI }) => {
  const state = getState();

  if (!username && !getIsAuthenticated(state)) {
    return dispatch({ type: GET_NOTIFICATIONS.ERROR });
  }

  const targetUsername = username || getAuthenticatedUserName(state);

  return dispatch({
    type: GET_NOTIFICATIONS.ACTION,
    meta: targetUsername,
    payload: {
      promise: blockchainLiteAPI.callAsync('get_notifications', [targetUsername]),
    },
  });
};

export const GET_NETWORK_USER_LIST = createAsyncActionType('@user/GET_NETWORK_USER_LIST');

export const getNetworkUsers = (nsfw) => (dispatch) => {
  return dispatch({
    type: GET_NETWORK_USER_LIST.ACTION,
    meta: {
      nsfw,
    },
    payload: {
      promise: getNetworkUserListFromAPI(),
    },
  });
};

export const GET_TOP_FOLLOWED_LIST = createAsyncActionType('@user/GET_TOP_FOLLOWED_LIST');

export const getTopFollowed = () => (dispatch) => {
  return dispatch({
    type: GET_TOP_FOLLOWED_LIST.ACTION,
    payload: {
      promise: getTopFollowedListFromAPI(),
    },
  });
};

export const GET_ALL_ACCOUNTS = createAsyncActionType('@user/GET_ALL_ACCOUNTS');

export const getAllAccounts = () => (dispatch) => {
  return dispatch({
    type: GET_ALL_ACCOUNTS.ACTION,
    payload: {
      promise: getAllAccountsFromAPI(),
    },
  });
};