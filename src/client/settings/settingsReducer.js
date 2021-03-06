import * as settingsTypes from './settingsActions';
import * as authTypes from '../auth/authActions';
import { rewardsValues } from '../../common/constants/rewards';
import { boardValues } from '../../common/constants/boards';

const initialState = {
  locale: 'auto',
  votingPower: 'off',
  votePercent: 10000,
  showNSFWPosts: false,
  showImagesOnly: false,
  nightmode: false,
  rewriteLinks: false,
  loading: false,
  upvoteSetting: true,
  exitPageSetting: false,
  rewardSetting: rewardsValues.half,
  boardSetting: boardValues.random,
  languageSetting: 'en',
  access: 'public',
  accessList: [],
  useBeta: false,
};

const settings = (state = initialState, action) => {
  switch (action.type) {
    case authTypes.LOGIN_SUCCESS:
    case authTypes.RELOAD_SUCCESS:
      if (action.meta && action.meta.refresh) return state;
      if (action.payload.user_metadata && action.payload.user_metadata.settings) {
        const {
          locale,
          votingPower,
          votePercent,
          showImagesOnly,
          showNSFWPosts,
          nightmode,
          rewriteLinks,
          upvoteSetting,
          exitPageSetting,
          rewardSetting,
          boardSetting,
          languageSetting,
          accessList,
          access,
          useBeta,
        } = action.payload.user_metadata.settings;
        return {
          ...state,
          locale: locale || initialState.locale,
          votingPower: votingPower || initialState.votingPower,
          votePercent: votePercent || initialState.votePercent,
          showNSFWPosts: showNSFWPosts || initialState.showNSFWPosts,
          showImagesOnly: showImagesOnly || initialState.showImagesOnly,
          nightmode: nightmode || initialState.nightmode,
          rewriteLinks:
            typeof rewriteLinks === 'boolean' ? rewriteLinks : initialState.rewriteLinks,
          upvoteSetting:
            typeof upvoteSetting === 'boolean' ? upvoteSetting : initialState.upvoteSetting,
          exitPageSetting:
            typeof exitPageSetting === 'boolean' ? exitPageSetting : initialState.exitPageSetting,
          rewardSetting: rewardSetting || initialState.rewardSetting,
          boardSetting: boardSetting || initialState.boardSetting,
          languageSetting: languageSetting || initialState.languageSetting,
          accessList: accessList || initialState.accessList,
          access: access || initialState.access,
          useBeta: typeof useBeta === 'boolean' ? useBeta : initialState.useBeta,
        };
      }
      return state;
    case settingsTypes.SAVE_SETTINGS_START:
      return {
        ...state,
        loading: true,
      };
    case settingsTypes.SAVE_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        locale: action.payload.locale,
        votingPower: action.payload.votingPower,
        votePercent: action.payload.votePercent,
        showNSFWPosts: action.payload.showNSFWPosts,
        showImagesOnly : action.payload.showImagesOnly,
        nightmode: action.payload.nightmode,
        rewriteLinks: action.payload.rewriteLinks,
        upvoteSetting: action.payload.upvoteSetting,
        exitPageSetting: action.payload.exitPageSetting,
        rewardSetting: action.payload.rewardSetting,
        boardSetting: action.payload.boardSetting,
        languageSetting: action.payload.languageSetting,
        accessList: action.payload.accessList,
        access: action.payload.access,
        useBeta: !!action.payload.useBeta,
      };
    case settingsTypes.SAVE_SETTINGS_ERROR:
      return {
        ...state,
        loading: false,
      };
    case settingsTypes.SET_LOCALE:
      return {
        ...state,
        locale: action.payload,
      };
    default:
      return state;
  }
};

export default settings;

export const getIsLoading = state => state.loading;
export const getLocale = state => state.locale;
export const getVotingPower = state => state.votingPower;
export const getVotePercent = state => state.votePercent;
export const getShowNSFWPosts = state => state.showNSFWPosts;
export const getShowImagesOnly = state => state.showImagesOnly;
export const getNightmode = state => state.nightmode;
export const getRewriteLinks = state => !!state.rewriteLinks;
export const getUpvoteSetting = state => state.upvoteSetting;
export const getExitPageSetting = state => state.exitPageSetting;
export const getRewardSetting = state => state.rewardSetting;
export const getBoardSetting = state => state.boardSetting;
export const getLanguageSetting = state => state.languageSetting;
export const getAccessListSetting = state => state.accessList;
export const getAccessSetting = state => state.access;
export const getUseBeta = state => state.useBeta;
