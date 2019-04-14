import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Cookie from 'js-cookie';
import _ from 'lodash';
import { showPostModal } from '../app/appActions';
import { getFeedContent, getMoreFeedContent } from './feedActions';
import { Checkbox, Form, Input, Select, Button} from 'antd';
import { Link } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';

import {
  getFeedFromState,
  getFeedLoadingFromState,
  getFeedFetchedFromState,
  getFeedHasMoreFromState,
  getFeedFailedFromState,
} from '../helpers/stateHelpers';

import { getIsAuthenticated, getIsLoaded, getAuthenticatedUser, getFeed } from '../reducers';
import Feed from './Feed';
import FetchFailed from '../statics/FetchFailed';
import EmptyFeed from '../statics/EmptyFeed';
import LetsGetStarted from './LetsGetStarted';
import ScrollToTop from '../components/Utils/ScrollToTop';
import PostModal from '../post/PostModalContainer';

@withRouter
@connect(
  state => ({
    authenticated: getIsAuthenticated(state),
    loaded: getIsLoaded(state),
    user: getAuthenticatedUser(state),
    feed: getFeed(state),
  }),
  dispatch => ({
    getFeedContent: (sortBy, category) => 
      dispatch(getFeedContent({sortBy: sortBy, category: category, limit: 9 })),
    getMoreFeedContent: (sortBy, category) =>
      dispatch(getMoreFeedContent({ sortBy: sortBy, category: category, limit: 9 })),
    showPostModal: post => dispatch(showPostModal(post)),
  }),
)
class SubFeed extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    user: PropTypes.shape().isRequired,
    feed: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    showPostModal: PropTypes.func.isRequired,
    getFeedContent: PropTypes.func,
    getMoreFeedContent: PropTypes.func,
  };

  static defaultProps = {
    getFeedContent: () => {},
    getMoreFeedContent: () => {},
  };
  state = {
    stateReady: false,
    keyReady: true,
  };

  componentDidMount() {
    //console.log("COMPONENT DID MOUNT");
    const { authenticated, loaded, user, match, feed } = this.props;

    let storagekey = "UserMemoKey-"+user.name;
    if (_.isEmpty(localStorage.getItem(storagekey))) {
      this.setState({
        keyReady: false,
      });
    }

    const sortBy1 = match.params.sortBy1 || 'trending';
    const sortBy2 = match.params.sortBy2 || 'hot';
    let category1 = match.params.category1 || 'all';
    let category2 = match.params.category2 || 'all';

    let isFetching = false;
    let fetched = false;
    let hasMore = false;
    let failed = false;

    let isFetching1 = false;
    let fetched1 = false;
    let hasMore1 = false;
    let failed1 = false;

    let isFetching2 = false;
    let fetched2 = false;
    let hasMore2 = false;
    let failed2 = false;

    let isFetching3 = false;
    let fetched3 = false;
    let hasMore3 = false;
    let failed3 = false;

    let isFetchingP = false;
    let fetchedP = false;
    let hasMoreP = false;
    let failedP = false;

    // console.log("Mounted - Loaded:", loaded);
    if (!loaded && Cookie.get('access_token')) return;

    isFetching1 = getFeedLoadingFromState(sortBy1, category1, feed);
    isFetching2 = getFeedLoadingFromState(sortBy2, category2, feed);
    isFetchingP = getFeedLoadingFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    isFetching3 = getFeedLoadingFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    isFetching = isFetching1 || isFetching2 || isFetching3 || isFetchingP;

    fetched1 = getFeedFetchedFromState(sortBy1, category1, feed);
    fetched2 = getFeedFetchedFromState(sortBy2, category2, feed);
    fetchedP = getFeedFetchedFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    fetched3 = getFeedFetchedFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    fetched = fetched1 && fetched2 && fetched3 && fetchedP;

    hasMore1 = getFeedHasMoreFromState(sortBy1, category1, feed);
    hasMore2 = getFeedHasMoreFromState(sortBy2, category2, feed);
    hasMore = hasMore1 || hasMore2;

    failed1 = getFeedFailedFromState(sortBy1, category1, feed);
    failed2 = getFeedFailedFromState(sortBy2, category2, feed);
    failedP = getFeedFailedFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    failed3 = getFeedFailedFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    failed = failed1 || failed2 || failed3 || failedP;
    
    // console.log("Feed did mount:", feed);
    // console.log("Fetched status:", fetched1, fetched2);

    if (!fetched){
    // console.log("ComponentDidMount: Getting Feed content");
    this.props.getFeedContent([sortBy1, sortBy2], [category1, category2]);
    };
  };

  componentWillReceiveProps(nextProps) {
    //console.log("COMPONENT WILL RECEIVE PROPS");
    const { authenticated, loaded, user, match, feed } = nextProps;
    const {stateReady} = this.state;
    const oldSortBy1 = this.props.match.params.sortBy1 || 'trending';
    const newSortBy1 = match.params.sortBy1 || 'trending';
    const oldSortBy2 = this.props.match.params.sortBy2 || 'hot';
    const newSortBy2 = match.params.sortBy2 || 'hot';
    const oldCategory1 = this.props.match.params.category1 || 'all';
    const newCategory1 = match.params.category1 || 'all';
    const oldCategory2 = this.props.match.params.category2 || 'all';
    const newCategory2 = match.params.category2 || 'all';
    const wasAuthenticated = this.props.authenticated;
    const isAuthenticated = authenticated;
    const wasLoaded = this.props.loaded;
    const isLoaded = loaded;

    let isFetching = false;
    let fetched = false;
    
    let isFetching1 = false;
    let fetched1 = false;
    
    let isFetching2 = false;
    let fetched2 = false;
    
    let isFetching3 = false;
    let fetched3 = false;
   
    let isFetchingP = false;
    let fetchedP = false;

    if (!isLoaded && Cookie.get('access_token')) return;

    if ((oldSortBy1 !== newSortBy1) || 
    (oldSortBy2 !== newSortBy2) || 
    (oldCategory1 !== newCategory1) || 
    (oldCategory2 !== newCategory2) || 
    (!wasLoaded && isLoaded) ||
    (wasAuthenticated != isAuthenticated)) 
    {

      isFetching1 = getFeedLoadingFromState(newSortBy1, newCategory1, feed);
      isFetching2 = getFeedLoadingFromState(newSortBy2, newCategory2, feed);
      isFetchingP = getFeedLoadingFromState([newSortBy1, newSortBy2].join('-'), 'promoted', feed);
      isFetching3 = getFeedLoadingFromState([newSortBy1, newSortBy2].join('-'), [newCategory1, newCategory2].join('-'), feed);
      isFetching = isFetching1 || isFetching2 || isFetching3 || isFetchingP;

      fetched1 = getFeedFetchedFromState(newSortBy1, newCategory1, feed);
      fetched2 = getFeedFetchedFromState(newSortBy2, newCategory2, feed);
      fetchedP = getFeedFetchedFromState([newSortBy1, newSortBy2].join('-'), 'promoted', feed);
      fetched3 = getFeedFetchedFromState([newSortBy1, newSortBy2].join('-'), [newCategory1, newCategory2].join('-'), feed);
      fetched = fetched1 && fetched2 && fetched3 && fetchedP;

      //console.log("NEWPROPS Fetching:", isFetching1, isFetching2, isFetching3, isFetchingP, "Fetched:", fetched1, fetched2, fetched3, fetchedP, "State ready:", stateReady);

      if (!isFetching) {
        //console.log("GettingNewPropsFeedContent", newSortBy1, newSortBy2, newCategory1, newCategory2);
        this.props.getFeedContent([newSortBy1, newSortBy2], [newCategory1, newCategory2]);
      };
      if (!isFetching && fetched && !stateReady) {
        //console.log("STATE READY ACTIVATED");
        this.setState({
          stateReady: true,
        });
      };
    };
  };

  render() {
    //console.log("RENDER");
    const { authenticated, loaded, feed, match } = this.props;
    const { stateReady, keyReady } = this.state;

    const sortBy1 = match.params.sortBy1 || 'trending';
    const sortBy2 = match.params.sortBy2 || 'hot';
    let category1 = match.params.category1 || 'all';
    let category2 = match.params.category2 || 'all';

    // console.log("Username:", user.name);
    
    let content = [];

    let isFetching = false;
    let fetched = false;
    let hasMore = false;
    let failed = false;

    let isFetching1 = false;
    let fetched1 = false;
    let hasMore1 = false;
    let failed1 = false;

    let isFetching2 = false;
    let fetched2 = false;
    let hasMore2 = false;
    let failed2 = false;

    let isFetching3 = false;
    let fetched3 = false;
    let hasMore3 = false;
    let failed3 = false;

    let isFetchingP = false;
    let fetchedP = false;
    let hasMoreP = false;
    let failedP = false;

    let loadMoreContent = () => {};
    
    isFetching1 = getFeedLoadingFromState(sortBy1, category1, feed);
    isFetching2 = getFeedLoadingFromState(sortBy2, category2, feed);
    isFetchingP = getFeedLoadingFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    isFetching3 = getFeedLoadingFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    isFetching = isFetching1 || isFetching2 || isFetching3 || isFetchingP;

    fetched1 = getFeedFetchedFromState(sortBy1, category1, feed);
    fetched2 = getFeedFetchedFromState(sortBy2, category2, feed);
    fetchedP = getFeedFetchedFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    fetched3 = getFeedFetchedFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    fetched = fetched1 && fetched2 && fetched3 && fetchedP;

    hasMore1 = getFeedHasMoreFromState(sortBy1, category1, feed);
    hasMore2 = getFeedHasMoreFromState(sortBy2, category2, feed);
    hasMore = hasMore1 || hasMore2;

    failed1 = getFeedFailedFromState(sortBy1, category1, feed);
    failed2 = getFeedFailedFromState(sortBy2, category2, feed);
    failedP = getFeedFailedFromState([sortBy1, sortBy2].join('-'), 'promoted', feed);
    failed3 = getFeedFailedFromState([sortBy1,sortBy2].join('-'), [category1, category2].join('-'), feed);
    failed = failed1 || failed2 || failed3 || failedP;

    loadMoreContent = () => this.props.getMoreFeedContent([sortBy1, sortBy2], [category1, category2]);
    
    //console.log("Fetching:", isFetching1, isFetching2, isFetching3, isFetchingP, "Fetched:", fetched1, fetched2, fetched3, fetchedP, "State ready:", stateReady);

    //console.log("Rendering:", sortBy1, sortBy2, category1, category2);

    if (!isFetching && fetched && !stateReady) {
      //console.log("STATE READY ACTIVATED");
      this.setState({
        stateReady: true,
      });
    };

    if (stateReady) {
    content = getFeedFromState([sortBy1, sortBy2].join('-'), [category1, category2].join('-'), feed);
    //console.log("Loaded Feed from state:", content, "Feed", feed);
    };
    
    const empty = _.isEmpty(content);
    const displayEmptyFeed = empty && fetched && loaded && !isFetching && !failed;

    const ready = loaded && fetched && !isFetching;

    return (
      <div>
        {authenticated && <LetsGetStarted />}
        {authenticated && !keyReady && ready && (  
          <div className="Story__keymessage">
            <div> 
              <i className="iconfont icon-lock" />
              <FormattedMessage id="key_not_found" defaultMessage="To create and read private posts, please generate your secret key." />
            </div>
            <div>
              <Link to="/edit-profile" >
                <Button> 
                  <FormattedMessage id="generate_key" defaultMessage="Generate Key" />
                </Button>
              </Link> 
            </div>
          </div>
        )}
        {empty && <ScrollToTop />}
        <Feed
          content={content}
          isFetching={isFetching}
          hasMore={hasMore}
          loadMoreContent={loadMoreContent}
          showPostModal={this.props.showPostModal}
        />
        {ready && failed && <FetchFailed />}
        {displayEmptyFeed && <EmptyFeed />}
        <PostModal />
      </div>
    );
  }
}

export default SubFeed;
