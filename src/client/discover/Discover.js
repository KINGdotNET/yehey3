import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import DiscoverContent from './DiscoverContent';
import Affix from '../components/Utils/Affix';
import './Discover.less';

const Discover = ({ intl }) => (
  <div className="shifted">
    <Helmet>
      <title>
        {intl.formatMessage({ id: 'discover_more_people', defaultMessage: 'discover_more_people' })}{' '}
        - WeYouMe
      </title>
    </Helmet>
    <div className="feed-layout container">
      <Affix className="leftContainer" stickPosition={77}>
        <div className="left">
          <LeftSidebar />
        </div>
      </Affix>
      <div className="center">
      <div className="Discover">
        <div className="Discover__title">
          <h1>
            <FormattedMessage id="discover_more_people" defaultMessage="Discover more people" />
          </h1>
        </div>
        </div>
        <div className="Discover__content">
          <DiscoverContent />
        </div>
      </div>
      <Affix className="rightContainer" stickPosition={77}>
							<div className="right">
								<RightSidebar />
							</div>
						</Affix>
    </div>
  </div>
);

Discover.propTypes = {
  intl: PropTypes.shape().isRequired,
};

export default injectIntl(Discover);
