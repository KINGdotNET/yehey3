import _ from 'lodash';
import * as feedTypes from './feedActions';
import { TOGGLE_BOOKMARK } from '../bookmarks/bookmarksActions';

const initialState = {
  feed: {},
  hot: {},
  cashout: {},
  created: {},
  active: {},
  trending: {},
  comments: {},
  blog: {},
  bookmarks: {},
  replies: {},
  promoted: {},
};

const feedIdsList = (state = [], action, index) => {
  switch (action.type) {
    case feedTypes.GET_FEED_CONTENT.START:
    case feedTypes.GET_USER_COMMENTS.START:
    case feedTypes.GET_REPLIES.START:
    case feedTypes.GET_BOOKMARKS.START:
      // console.log("Getting feedIDsList Start:", index, action);
      return [];
    case feedTypes.GET_FEED_CONTENT.SUCCESS:
      // console.log("Getting feedIDsList Success:", index, action);
      if (!action.payload) return [];
      if (!action.payload[index]) return [];
      if (!action.payload[index][0]) return [];
      return (action.payload[index][0].id) ? (_.uniq([...action.payload[index].map(post => post.id)])) : []; 
    case feedTypes.GET_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_REPLIES.SUCCESS:
    case feedTypes.GET_BOOKMARKS.SUCCESS:
      if (!action.payload) return [];
      return action.payload.map(post => post.id)
    case feedTypes.GET_MORE_FEED_CONTENT.SUCCESS:
      // console.log("Getting more feedIDsList Success:", index, action);
      if (!action.payload) return [];
      if (!action.payload[index]) return [];
      if (!action.payload[index][0]) return [];
      return (action.payload[index][0].id) ? (_.uniq([...state, ...action.payload[index].map(post => post.id)])) : [];
    case feedTypes.GET_MORE_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_MORE_REPLIES.SUCCESS:
      return _.uniq([...state, ...action.payload.map(post => post.id)]);
    default:
      return state;
  }
};

const feedCategory = (state = {}, action, index) => {
  switch (action.type) {
    case feedTypes.GET_FEED_CONTENT.START:
    case feedTypes.GET_MORE_FEED_CONTENT.START:
    case feedTypes.GET_USER_COMMENTS.START:
    case feedTypes.GET_MORE_USER_COMMENTS.START:
    case feedTypes.GET_REPLIES.START:
    case feedTypes.GET_MORE_REPLIES.START:
    case feedTypes.GET_BOOKMARKS.START:
      // console.log("Getting Feedcategory Start:", index, action);
      return {
        ...state,
        isFetching: true,
        isLoaded: false,
        failed: false,
        list: feedIdsList(state.list, action, index),
      };
    case feedTypes.GET_FEED_CONTENT.SUCCESS:
    case feedTypes.GET_MORE_FEED_CONTENT.SUCCESS:
      // console.log("Getting Feedcategory Success:", index, action);
      return {
        ...state,
        isFetching: false,
        isLoaded: true,
        failed: false,
        hasMore: action.payload[index] ? ((action.payload[index][index]) ? ((action.payload[index].length) === action.meta.limit) || action.meta.once : false) : false,
        list: feedIdsList(state.list, action, index),
      };
    case feedTypes.GET_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_MORE_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_REPLIES.SUCCESS:
    case feedTypes.GET_MORE_REPLIES.SUCCESS:
    case feedTypes.GET_BOOKMARKS.SUCCESS:
    return {
      ...state,
      isFetching: false,
      isLoaded: true,
      failed: false,
      hasMore: action.payload.length === action.meta.limit || action.meta.once,
      list: feedIdsList(state.list, action, index),
    };
    case feedTypes.GET_FEED_CONTENT.ERROR:
    case feedTypes.GET_MORE_FEED_CONTENT.ERROR:
    case feedTypes.GET_USER_COMMENTS.ERROR:
    case feedTypes.GET_MORE_USER_COMMENTS.ERROR:
    case feedTypes.GET_REPLIES.ERROR:
    case feedTypes.GET_MORE_REPLIES.ERROR:
    case feedTypes.GET_BOOKMARKS.ERROR:
    // console.log("Feedcategory", index, "error");
      return {
        ...state,
        isFetching: false,
        isLoaded: true,
        failed: true,
        hasMore: false,
      };
    default:
      return state;
  }
};

const feedSortBy = (state = {}, action) => {
  switch (action.type) {
    case feedTypes.GET_FEED_CONTENT.START:
    case feedTypes.GET_FEED_CONTENT.SUCCESS:
    case feedTypes.GET_FEED_CONTENT.ERROR:
    case feedTypes.GET_MORE_FEED_CONTENT.START:
    case feedTypes.GET_MORE_FEED_CONTENT.SUCCESS:
    case feedTypes.GET_MORE_FEED_CONTENT.ERROR:
      return {
        ...state,
        [action.meta.category[0]]: feedCategory(state[action.meta.category[0]], action, 0),
        [action.meta.category[1]]: feedCategory(state[action.meta.category[1]], action, 1),
        [action.meta.category[2]]: feedCategory(state[action.meta.category[2]], action, 2),
      };
    case feedTypes.GET_USER_COMMENTS.START:
    case feedTypes.GET_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_USER_COMMENTS.ERROR:
    case feedTypes.GET_MORE_USER_COMMENTS.START:
    case feedTypes.GET_MORE_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_MORE_USER_COMMENTS.ERROR:
    case feedTypes.GET_REPLIES.START:
    case feedTypes.GET_REPLIES.SUCCESS:
    case feedTypes.GET_REPLIES.ERROR:
    case feedTypes.GET_MORE_REPLIES.START:
    case feedTypes.GET_MORE_REPLIES.SUCCESS:
    case feedTypes.GET_MORE_REPLIES.ERROR:
    case feedTypes.GET_BOOKMARKS.START:
    case feedTypes.GET_BOOKMARKS.SUCCESS:
    case feedTypes.GET_BOOKMARKS.ERROR:
      return {
        ...state,
        [action.meta.category]: feedCategory(state[action.meta.category], action, 0),
      };
    default:
      return state;
  }
};

const feed = (state = initialState, action) => {
  switch (action.type) {
    case feedTypes.GET_FEED_CONTENT.START:
    case feedTypes.GET_FEED_CONTENT.SUCCESS:
    case feedTypes.GET_FEED_CONTENT.ERROR:
    case feedTypes.GET_MORE_FEED_CONTENT.START:
    case feedTypes.GET_MORE_FEED_CONTENT.SUCCESS:
    case feedTypes.GET_MORE_FEED_CONTENT.ERROR:
      // console.log("Getting FeedState Init", action);
      return {
        ...state,
        [action.meta.sortBy[0]]: feedSortBy(state[action.meta.sortBy[0]], action, 0),
        [action.meta.sortBy[1]]: feedSortBy(state[action.meta.sortBy[1]], action, 1),
        [action.meta.sortBy.join('-')]: feedSortBy(state[action.meta.sortBy.join('-')], action, 2),
      };
    case feedTypes.GET_USER_COMMENTS.START:
    case feedTypes.GET_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_USER_COMMENTS.ERROR:
    case feedTypes.GET_MORE_USER_COMMENTS.START:
    case feedTypes.GET_MORE_USER_COMMENTS.SUCCESS:
    case feedTypes.GET_MORE_USER_COMMENTS.ERROR:
    case feedTypes.GET_REPLIES.START:
    case feedTypes.GET_REPLIES.SUCCESS:
    case feedTypes.GET_REPLIES.ERROR:
    case feedTypes.GET_MORE_REPLIES.START:
    case feedTypes.GET_MORE_REPLIES.SUCCESS:
    case feedTypes.GET_MORE_REPLIES.ERROR:
    case feedTypes.GET_BOOKMARKS.START:
    case feedTypes.GET_BOOKMARKS.SUCCESS:
    case feedTypes.GET_BOOKMARKS.ERROR:
      return {
        ...state,
        [action.meta.sortBy]: feedSortBy(state[action.meta.sortBy], action, 0),
      };
    case TOGGLE_BOOKMARK:
      return {
        ...state,
        bookmarks: {
          ...state.bookmarks,
          all: {
            ...state.bookmarks.all,
            list: state.bookmarks.all.list.filter(item => item !== action.meta.id),
          },
        },
      };
    default:
      return state;
  }
};

export default feed;

export const getFeed = state => state;
