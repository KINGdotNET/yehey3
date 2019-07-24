import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { getFeedContent } from './feedActions';
import { getIsLoaded, getIsAuthenticated } from '../reducers';
import SubFeed from './SubFeed';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import TopicSelector from '../components/TopicSelector';
import Affix from '../components/Utils/Affix';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import QuickPostEditor from '../components/QuickPostEditor/QuickPostEditor';

@connect(state => ({
  authenticated: getIsAuthenticated(state),
  loaded: getIsLoaded(state),
}))
class Page extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    history: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
  };

  static fetchData({ store, match }) {
    const { sortBy1, sortBy2, category1, category2 } = match.params;
    return Promise.all([
      store.dispatch(getFeedContent({sortBy: [sortBy1, sortBy2], category: [category1, category2], limit: 20 })),
    ]);
  };

  handleSortChange1 = key => {
    const { category1, category2, sortBy2 } = this.props.match.params;
    if (category1 && category2) {
      this.props.history.push(`/${key}-${category1}/${sortBy2}-${category2}`);
    } else {
      this.props.history.push(`/${key}-/${sortBy2}-`);
    }
  };
  handleSortChange2 = key => {
    const { category1, category2, sortBy1 } = this.props.match.params;
    if (category1 && category2) {
      this.props.history.push(`/${sortBy1}-${category1}/${key}-${category2}`);
    } else {
      this.props.history.push(`/${sortBy1}-/${key}-`);
    }
  };

  handleTopicClose = () => this.props.history.push('/trending-all/hot-all');

  render() {
    const { authenticated, loaded, location, match } = this.props;
    const { category1, category2, sortBy1, sortBy2 } = match.params;
    if (!authenticated) {
      this.props.history.push(`/welcome`);
    }
    if (!category1 && !category2 && !sortBy1 && !sortBy2) {
      this.props.history.push(`/trending-all/hot-all`);
    }
    const robots = location.pathname === '/' ? 'index,follow' : 'noindex,follow';

    return (
      <div>
        <Helmet>
          <title>WeYouMe</title>
          <meta name="robots" content={robots} />
        </Helmet>
        <ScrollToTop />
        <ScrollToTopOnMount />
        <div className="shifted">
          <div className="feed-layout container">
            <Affix className="leftContainer" stickPosition={77}>
              <div className="left">
                <LeftSidebar />
              </div>
            </Affix>
            <div className="center">
              <TopicSelector
                  isSingle={true}
                  sort={sortBy1}
                  topics={category1 ? [category1] : []}
                  onSortChange={this.handleSortChange1}
                  onTopicClose={this.handleTopicClose}
              />
              <TopicSelector
                  isSingle={true}
                  sort={sortBy2}
                  topics={category2 ? [category2] : []}
                  onSortChange={this.handleSortChange2}
                  onTopicClose={this.handleTopicClose}
              />
              <SubFeed />
            </div>
						<Affix className="rightContainer" stickPosition={77}>
							<div className="right">
								<RightSidebar />
							</div>
						</Affix>
          </div>
        </div>
      </div>
    );
  }
}

export default Page;
