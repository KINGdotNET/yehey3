import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import * as notificationConstants from '../../common/constants/notifications';
import { getUpdatedSCUserMetadata } from '../auth/authActions';
import { getNotifications } from '../user/userActions';
import { saveNotificationsLastTimestamp } from '../helpers/metadata';
import {
  getAuthenticatedUserSCMetaData,
  getNotifications as getNotificationsState,
  getIsLoadingNotifications,
  getAuthenticatedUserName,
} from '../reducers';
import requiresLogin from '../auth/requiresLogin';
import NotificationReply from '../components/Navigation/Notifications/NotificationReply';
import NotificationMention from '../components/Navigation/Notifications/NotificationMention';
import NotificationFollowing from '../components/Navigation/Notifications/NotificationFollowing';
import NotificationVote from '../components/Navigation/Notifications/NotificationVote';
import NotificationReblog from '../components/Navigation/Notifications/NotificationReblog';
import NotificationTransfer from '../components/Navigation/Notifications/NotificationTransfer';
import NotificationVoteWitness from '../components/Navigation/Notifications/NotificationVoteWitness';
import Loading from '../components/Icon/Loading';
import weauthjsInstance from '../weauthjsInstance';
import './Notifications.less';
import { jsonParse } from '../helpers/formatter';

class Notifications extends React.Component {
  static propTypes = {
    loadingNotifications: PropTypes.bool.isRequired,
    getUpdatedSCUserMetadata: PropTypes.func.isRequired,
    getNotifications: PropTypes.func.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape()),
    currentAuthUsername: PropTypes.string,
    userSCMetaData: PropTypes.shape(),
    onActionInitiated: PropTypes.func,
    lastSeenTimestamp:PropTypes.number,
  };

  static defaultProps = {
    notifications: [],
    currentAuthUsername: '',
    userSCMetaData: {},
    lastSeenTimestamp: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      reactionsModalVisible: false,
    };

    this.handleRequestPayment = this.handleRequestPayment.bind(this);
  }

  componentDidMount() {
    const { userSCMetaData, notifications} = this.props;
    const lastSeenTimestamp = _.get(userSCMetaData, 'notifications_last_timestamp', 0);
    const latestNotification = _.get(notifications, 0);
    const timestamp = _.get(latestNotification, 'timestamp');
    this.props.getUpdatedSCUserMetadata();
    this.props.getNotifications();

    if (timestamp > lastSeenTimestamp) {
      saveNotificationsLastTimestamp(timestamp).then(() => this.props.getUpdatedSCUserMetadata());
    }

    //console.log("userSCMetaData:", userSCMetaData);
    //console.log("notifications::", notifications);
  }

  componentWillReceiveProps(nextProps) {
    
    const differentNotifications = !_.isEqual(
      _.size(this.props.notifications),
      _.size(nextProps.notifications),
    );
    if (differentNotifications){
    const latestNotification = _.get(nextProps.notifications, 0);
    const timestamp = _.get(latestNotification, 'timestamp');

    if (timestamp > nextProps.lastSeenTimestamp) {
      saveNotificationsLastTimestamp(timestamp).then(() => this.props.getUpdatedSCUserMetadata());
      }
    }
  }

  handleRequestPayment(e, transferQuery) {
    e.preventDefault();
    const win = window.open(weauthjsInstance.sign('transfer', transferQuery), '_blank');
    win.focus();
  };

  render() {
    const { notifications, currentAuthUsername, userSCMetaData, loadingNotifications } = this.props;
    const lastSeenTimestamp = _.get(userSCMetaData, 'notifications_last_timestamp', 0);

    return (
      <div className="shifted">
        <div className="feed-layout container">
          <Affix className="leftContainer" stickPosition={77}>
            <div className="left">
              <LeftSidebar />
            </div>
          </Affix>
          <div className="center">
            <div className="NotificationsPage">
              <div className="NotificationsPage__title">
                <h1>
                  <FormattedMessage id="notifications" defaultMessage="Notifications" />
                </h1>
              </div>
              <div className="NotificationsPage__content">
            
              {loadingNotifications && (
                <div className="NotificationsPage__loading">
                  <Loading />
                </div>
              )}
              {_.map(notifications, (notification, index) => {
                const key = `${index}${notification.timestamp}`;
                const read = lastSeenTimestamp >= notification.timestamp;
                switch (notification.type) {
                  case notificationConstants.REPLY:
                    return (
                      <NotificationReply
                        key={key}
                        notification={notification}
                        currentAuthUsername={currentAuthUsername}
                        read={read}
                      />
                    );
                  case notificationConstants.FOLLOW:
                    return (
                      <NotificationFollowing key={key} notification={notification} read={read} />
                    );
                  case notificationConstants.MENTION:
                    return (
                      <NotificationMention key={key} notification={notification} read={read} />
                    );
                  case notificationConstants.VOTE:
                    return (
                      <NotificationVote
                        key={key}
                        notification={notification}
                        read={read}
                        currentAuthUsername={currentAuthUsername}
                      />
                    );
                  case notificationConstants.REBLOG:
                    return (
                      <NotificationReblog
                        key={key}
                        notification={notification}
                        read={read}
                        currentAuthUsername={currentAuthUsername}
                      />
                    );
                  case notificationConstants.TRANSFER:
                    return (
                      <NotificationTransfer 
                        key={key} 
                        notification={notification} 
                        read={read} 
                        onRequestClick={this.handleRequestPayment} />
                    );
                  case notificationConstants.WITNESS_VOTE:
                    return (
                      <NotificationVoteWitness key={key} notification={notification} read={read} />
                    );
                  default:
                    return null;
                }
              })}
              {_.isEmpty(notifications) &&
                !loadingNotifications && (
                  <div className="Notification Notification__empty">
                    <FormattedMessage
                      id="notifications_empty_message"
                      defaultMessage="You currently have no notifications."
                    />
                  </div>
                )}
            </div>
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
  }
}

export default connect(
  state => ({
    notifications: getNotificationsState(state),
    userSCMetaData: getAuthenticatedUserSCMetaData(state),
    currentAuthUsername: getAuthenticatedUserName(state),
    loadingNotifications: getIsLoadingNotifications(state),
  }),
  {
    getUpdatedSCUserMetadata,
    getNotifications,
  },
)(requiresLogin(Notifications));
