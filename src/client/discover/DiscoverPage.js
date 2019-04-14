import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { Route, Switch, withRouter } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import {
  gettotalSCORE,
  getSCOREbackingTMEfundBalance,
  getIsFetchingAllAccountsList,
  getAllAccountsList,
} from '../reducers';
import {
    getGlobalProperties,
  } from '../wallet/walletActions';
import { getAllAccounts } from '../user/userActions';
import { injectIntl, FormattedMessage } from 'react-intl';
import Error404 from '../statics/Error404';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import DiscoverMenu from '../components/DiscoverMenu';
import './DiscoverPage.less';

@withRouter
@connect(
  (state) => ({
    isFetchingAllAccountsList: getIsFetchingAllAccountsList(state),
    allAccounts: getAllAccountsList(state),
    totalSCORE: gettotalSCORE(state),
    getSCOREbackingTMEfundBalance: getSCOREbackingTMEfundBalance(state),
  }),
  {
    getAllAccounts,
    getGlobalProperties,
  },
)
export default class DiscoverPage extends React.Component {
  static propTypes = {
    route: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    allAccounts: PropTypes.array.isRequired,
    getAllAccounts: PropTypes.func.isRequired,
    totalSCORE: PropTypes.string.isRequired,
    getSCOREbackingTMEfundBalance: PropTypes.string.isRequired,
    
  };

  static defaultProps = {
    allAccounts: [],
    getAllAccounts: () => {},
    getGlobalProperties: () => {},
  };

  static fetchData({ store, match }) {
    return Promise.all([
        store.dispatch(getGlobalProperties()),
        store.dispatch(getAllAccounts()),
    ]);   
  }

  onChange = key => {
    //console.log("On key change:", key);
    const { match, history } = this.props;
    const section = key === 'recommended' ? '/' : `/${key}`;
    history.push(`${match.url.replace(/\/([^/]*)$/, '')}${section}`);
    //console.log("matchurl", match.url, match.url.replace(/\/([^/]*)$/, ''));

  };

  componentDidMount() {
    //this.props.getAllAccounts();
  };

  render() {
    const { match, location, history, ...otherProps} = this.props;
    const current = this.props.location.pathname.split('/')[2];
    const busyHost = global.postOrigin || 'https://alpha.weyoume.io';
    const canonicalUrl = `${busyHost}/discover`;
    //console.log("Rendered Route:" , current);
    const currentKey = current || 'recommended';
    const title = `Discover Accounts`;

    return (
      <div className="main-panel">
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
            <DiscoverMenu defaultKey={currentKey} onChange={this.onChange} {...otherProps} />
        <ScrollToTopOnMount />
        <div className="shifted">
          <div className="feed-layout container">
            <Affix className="leftContainer leftContainer__user" stickPosition={72}>
              <div className="left">
                <LeftSidebar />
              </div>
            </Affix>
            <div className="center">
                <div className="DiscoverPage">
                  <h1 className="DiscoverPage__title">
                      <FormattedMessage id="discover_more_people" defaultMessage="Discover more people" />
                  </h1>
                  <div className="DiscoverPage__content">
                      {renderRoutes(this.props.route.routes)}
                  </div>
                </div>
            </div>
            <Affix className="rightContainer" stickPosition={72}>
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
