import * as actions from './userActions';
import * as appTypes from '../app/appActions';
import { filterNSFWwords } from '../helpers/postHelpers.js';

const initialState = {
  recommendations: [],
  following: {
    followingList: [],
    followerList: [],
    mutualList: [],
    pendingFollows: [],
    isFetching: false,
    fetched: false,
  },
  userMemoPrivateKey: '',
  notifications: [],
  latestNotification: {},
  loadingNotifications: false,
  fetchFollowListError: false,
  networkUsers: [],
  topFollowed: [],
  allAccounts: [],
  loadingNetworkUsers: false,
  loadingTopFollowed: false,
  loadingAllAccounts: false,
  nsfw: false,
};

// filterRecommendations generates a random list of `count` recommendations.
// Users are pulled from all accounts on the network, minus the network genesis accounts.
// filters users followed by the current user.

const filterRecommendations = (following, networkUsers, count = 5) => {
  const usernames = Object.values(following);

  return networkUsers
    .filter(p => !usernames.includes(p))
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(name => ({ name }));
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_FOLLOWING_START:
      return {
        ...state,
        following: {
          ...state.following,
          followingList: [],
          followerList: [],
          mutualList: [],
          isFetching: true,
          fetched: false,
        },
        fetchFollowListError: false,
      };
    case actions.GET_FOLLOWING_ERROR:
      return {
        ...state,
        following: {
          ...state.following,
          followingList: [],
          followerList: [],
          mutualList: [],
          isFetching: false,
          fetched: true,
        },
        fetchFollowListError: true,
      };
    case actions.GET_FOLLOWING_SUCCESS:
      return {
        ...state,
        recommendations: filterRecommendations(action.payload, state.networkUsers),
        following: {
          ...state.following,
          followingList: [...state.following.followingList, ...action.payload.following],
          followerList: [...state.following.followerList, ...action.payload.followers],
          mutualList: [...state.following.mutualList, ...action.payload.mutual],
          isFetching: false,
          fetched: true,
        },
        fetchFollowListError: false,
      };


    case actions.GET_NETWORK_USER_LIST.START:
      return {
        ...state,
        loadingNetworkUsers: true,
      };

    case actions.GET_NETWORK_USER_LIST.SUCCESS:
      if(action.meta.nsfw) {
        return {
          ...state,
          networkUsers: action.payload,
          loadingNetworkUsers: false,
        };
      } else {
        return {
          ...state,
          networkUsers: filterNSFWwords(action.payload),
          loadingNetworkUsers: false,
        };
      }
      
    case actions.GET_NETWORK_USER_LIST.ERROR:
      return {
        ...state,
        loadingNetworkUsers: false,
      };

    case actions.GET_TOP_FOLLOWED_LIST.START:
      return {
        ...state,
        loadingTopFollowed: true,
      };

    case actions.GET_TOP_FOLLOWED_LIST.SUCCESS:
      return {
        ...state,
        topFollowed: action.payload,
        loadingTopFollowed: false,
      };

    case actions.GET_TOP_FOLLOWED_LIST.ERROR:
      return {
        ...state,
        loadingTopFollowed: false,
      };

      case actions.GET_ALL_ACCOUNTS.START:
      return {
        ...state,
        loadingAllAccounts: true,
      };

    case actions.GET_ALL_ACCOUNTS.SUCCESS:
      return {
        ...state,
        allAccounts: action.payload,
        loadingAllAccounts: false,
      };

    case actions.GET_ALL_ACCOUNTS.ERROR:
      return {
        ...state,
        loadingAllAccounts: false,
      };

    case actions.FOLLOW_USER_START:
    case actions.UNFOLLOW_USER_START:
      return {
        ...state,
        following: {
          ...state.following,
          pendingFollows: [...state.following.pendingFollows, action.meta.username],
        },
      };
    case actions.FOLLOW_USER_SUCCESS:
      return {
        ...state,
        following: {
          ...state.following,
          followingList: [...state.following.followingList, action.meta.username],
          pendingFollows: state.following.pendingFollows.filter(
            user => user !== action.meta.username,
          ),
        },
      };
    case actions.UNFOLLOW_USER_SUCCESS:
      return {
        ...state,
        following: {
          ...state.following,
          followingList: state.following.followingList.filter(user => user !== action.meta.username),
          pendingFollows: state.following.pendingFollows.filter(
            user => user !== action.meta.username,
          ),
        },
      };

    case actions.FOLLOW_USER_ERROR:
    case actions.UNFOLLOW_USER_ERROR:
      return {
        ...state,
        following: {
          ...state.following,
          pendingFollows: state.following.pendingFollows.filter(
            user => user !== action.meta.username,
          ),
        },
      };

    case actions.UPDATE_RECOMMENDATIONS:
      return {
        ...state,
        recommendations: filterRecommendations(state.following.followingList, state.networkUsers),
      };

    case actions.GET_NOTIFICATIONS.START:
      return {
        ...state,
        loadingNotifications: true,
      };

    case actions.GET_NOTIFICATIONS.SUCCESS:
      return {
        ...state,
        notifications: action.payload,
        loadingNotifications: false,
      };

    case actions.GET_NOTIFICATIONS.ERROR:
      return {
        ...state,
        loadingNotifications: false,
      };

    case appTypes.ADD_NEW_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        latestNotification: action.payload,
      };
    default: {
      return state;
    }
  }
}

export const getFollowingList = state => state.following.followingList;
export const getFollowerList = state => state.following.followerList;
export const getMutualList = state => state.following.mutualList;
export const getPendingFollows = state => state.following.pendingFollows;
export const getIsFetchingFollowingList = state => state.following.isFetching;
export const getRecommendations = state => state.recommendations;
export const getNetworkUserList = state => state.networkUsers;
export const getIsFetchingNetworkUserList = state => state.loadingNetworkUsers;
export const getTopFollowedList = state => state.topFollowed;
export const getIsFetchingTopFollowedList = state => state.loadingTopFollowed;
export const getAllAccounts = state => state.allAccounts;
export const getIsFetchingAllAccounts = state => state.loadingAllAccounts;
export const getFollowingFetched = state => state.following.fetched;
export const getNotifications = state => state.notifications;
export const getIsLoadingNotifications = state => state.loadingNotifications;
export const getFetchFollowListError = state => state.fetchFollowListError;
export const getLatestNotification = state => state.latestNotification;
