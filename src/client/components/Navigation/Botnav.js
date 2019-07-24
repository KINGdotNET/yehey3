import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Menu, Input, Button } from 'antd';
import Action from '../Button/Action';
import classNames from 'classnames';
import { getUpdatedSCUserMetadata } from '../../auth/authActions';
import {
  getNotifications,
  getAuthenticatedUserSCMetaData,
  getIsLoadingNotifications,
} from '../../reducers';
import weauthjsInstance from '../../weauthjsInstance';
import { PARSED_NOTIFICATIONS } from '../../../common/constants/notifications';
import BTooltip from '../BTooltip';
import Avatar from '../Avatar';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import Popover from '../Popover';
import Notifications from './Notifications/Notifications';
import LanguageSettings from './LanguageSettings';
import './Botnav.less';

@injectIntl
@withRouter
@connect(
  state => ({
    notifications: getNotifications(state),
    userSCMetaData: getAuthenticatedUserSCMetaData(state),
    loadingNotifications: getIsLoadingNotifications(state),
  }),
  {
    getUpdatedSCUserMetadata,
  },
)
class Botnav extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    username: PropTypes.string,
    notifications: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    getUpdatedSCUserMetadata: PropTypes.func.isRequired,
    onMenuItemClick: PropTypes.func,
    userSCMetaData: PropTypes.shape(),
    loadingNotifications: PropTypes.bool,
  };

  static defaultProps = {
    notifications: [],
    username: undefined,
    onMenuItemClick: () => {},
    userSCMetaData: {},
    loadingNotifications: false,
  };

  static handleScrollToTop() {
    if (window) {
      window.scrollTo(0, 0);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      searchBarActive: false,
      popoverVisible: false,
      searchBarValue: '',
      notificationsPopoverVisible: false,
    };
  }

  handleMoreMenuSelect(key) {
    this.setState({ popoverVisible: false }, () => {
      this.props.onMenuItemClick(key);
    });
  }

  handleMoreMenuVisibleChange(visible) {
    this.setState({ popoverVisible: visible });
  }

  handleNotificationsPopoverVisibleChange(visible) {
    if (visible) {
      this.setState({ notificationsPopoverVisible: visible });
    } else {
      this.handleCloseNotificationsPopover();
    }
  }

  handleCloseNotificationsPopover() {
    this.setState({
      notificationsPopoverVisible: false,
    });
  }

  notificationButton = () => {

  }

  menuForLoggedOut = () => {
    const { location } = this.props;
    const next = location.pathname.length > 1 ? location.pathname : '';

    return (
      <div className='Botnav__menu-container Botnav__menu-logged-out'>
        <Menu className="Botnav__menu-container__menu" mode="horizontal">
          
        </Menu>
      </div>
    );
  };

  menuForLoggedIn = () => {
    const { intl, username, notifications, userSCMetaData, loadingNotifications } = this.props;
    const lastSeenTimestamp = _.get(userSCMetaData, 'notifications_last_timestamp', 0);
    const notificationsCount = _.isUndefined(lastSeenTimestamp)
      ? _.size(notifications)
      : _.size(
          _.filter(
            notifications,
            notification =>
              lastSeenTimestamp < notification.timestamp &&
              _.includes(PARSED_NOTIFICATIONS, notification.type),
          ),
        );
    const displayBadge = notificationsCount > 0;
    const notificationsCountDisplay = notificationsCount > 99 ? '99+' : notificationsCount;
    return (
      <div className='Botnav__menu-container'>
        <Menu selectedKeys={[]} className="Botnav__menu-container__menu" mode="horizontal">

          <Menu.Item key="home" className="Botnav__item--badge">
            <Link to={`/trending-all/feed-${username}`} className="Botnav__link Botnav__link--light Botnav__link--action">
                <i className="iconfont icon-homepage" />
            </Link>
          </Menu.Item>

          <Menu.Item key="messages" className="Botnav__item--badge">
            <Link to="/messages" className="Botnav__link Botnav__link--light Botnav__link--action">
                <i className="iconfont icon-mail" />
            </Link>
          </Menu.Item>
          
          <Menu.Item key="write" className="Botnav__item--badge">
            <Link to="/editor" className="Botnav__link Botnav__link--light Botnav__link--action">
                <i className="iconfont icon-addition" />
            </Link>
          </Menu.Item>

          <Menu.Item key="notifications" className="Botnav__item--badge">
                <Link to="/notifications" className="Botnav__link Botnav__link--light Botnav__link--action">
                <i className="iconfont icon-remind-old" />
                  {displayBadge ? (
                    <div className="Botnav__notifications-count">{notificationsCountDisplay}</div>
                  ): null }
                </Link>
          </Menu.Item>

          <Menu.Item key="wallet" className="Botnav__item--badge">
                <Link to="/wallet" className="Botnav__link Botnav__link--light Botnav__link--action">
                <i className="iconfont icon-wallet" />
                </Link>
          </Menu.Item>

        </Menu>
      </div>
    );
  };

  content = () => (this.props.username ? this.menuForLoggedIn() : this.menuForLoggedOut());

  render() {
    const { intl } = this.props;

    return (
      <div className="Botnav">
        <div className="Botnav-layout">
          <div className='left'>

          </div>
          <div className='center'>
          {this.content()}
          <div className="right">
            
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default Botnav;
