import _ from 'lodash';
import { createAsyncActionType } from '../helpers/stateHelpers';
import { getAccountReputation, getUserSearchResults } from '../helpers/apiHelpers';

export const SEARCH_ASK = createAsyncActionType('@search/SEARCH_ASK');
export const AUTO_COMPLETE_SEARCH = createAsyncActionType('@search/AUTO_COMPLETE_SEARCH');

export const userSearchBlockchain = (search, limit = 10) => dispatch => 
  dispatch({
    type: SEARCH_ASK.ACTION,
    payload: {
      promise: getUserSearchResults(search, limit)
          .then(response => response)
          .catch(() => []) 
    }
  });

export const postSearchBlockchain = (search, limit = 10) => dispatch => 
  dispatch({
    type: SEARCH_ASK.ACTION,
    payload: {
      promise: Promise.all(
        getUserSearchResults(search, limit)
          .then(response => response)
          .catch(() => []),
        
      ),
    },
  });

export const searchAutoComplete = (search, limit = 5) => dispatch =>
  dispatch({
    type: AUTO_COMPLETE_SEARCH.ACTION,
    payload: {
      promise: getUserSearchResults(search, limit).then(result => ({
        result,
        search,
      })),
    },
  });
