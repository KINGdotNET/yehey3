import _ from 'lodash';
import * as searchActions from './searchActions';
import formatter from '../helpers/blockchainProtocolFormatter';

const initialState = {
  loading: true,
  searchError: false,
  userSearchResults: [],
  autoCompleteSearchResults: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case searchActions.SEARCH_ASK.START:
      return {
        ...state,
        loading: true,
        searchError: false,
      };
    case searchActions.SEARCH_ASK.SUCCESS: {
      const userBlockchainResults = action.payload;
      const parsedlookupResults = _.map(userBlockchainResults, accountDetails => ({
        ...accountDetails,
        type: 'user',
      }));
      const userSearchResults = _.compact(parsedlookupResults);
      return {
        ...state,
        userSearchResults,
        loading: false,
      };
    }
    case searchActions.SEARCH_ASK.ERROR:
      return {
        ...state,
        userSearchResults: [],
        loading: false,
        searchError: true,
      };
    case searchActions.AUTO_COMPLETE_SEARCH.SUCCESS: {
      const { result, search } = action.payload;
      const resultsList = _.compact(_.slice(result, 0, 5)).map(user => user.name);
      return {
        ...state,
        autoCompleteSearchResults: _.isEmpty(search) ? [] : resultsList,
      };
    }
    default:
      return state;
  }
};

export const getSearchLoading = state => state.loading;
export const getUserSearchResults = state => state.userSearchResults;
export const getAutoCompleteSearchResults = state => state.autoCompleteSearchResults;
