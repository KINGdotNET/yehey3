import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router-dom';
import Avatar from '../../Avatar';
import { epochToUTC } from '../../../helpers/formatter';
import './Notification.less';

const NotificationMessage = ({ notification, read, onClick}) => (
  <Link
    to={`/messages/@${notification.sender}`}
    className={classNames('Notification', {
      'Notification--unread': !read,
    })}
    onClick={onClick}
  >
    <Avatar username={notification.sender} size={40} />
    <div className="Notification__text">
      <div className="Notification__text__message">
        <FormattedMessage
          id="notification_message_username"
          defaultMessage="{username} sent you a message"
          values={{
            username: <span className="username">{notification.sender}</span>,
          }}
        />
      </div>
      <div className="Notification__text__date">
        <FormattedRelative value={epochToUTC(notification.timestamp)} />
      </div>
    </div>
  </Link>
);

NotificationMessage.propTypes = {
  read: PropTypes.bool,
  notification: PropTypes.shape({
    sender: PropTypes.string,
    timestamp: PropTypes.number,
  }),
  onClick: PropTypes.func,
};

NotificationMessage.defaultProps = {
  read: false,
  notification: {},
  onClick: () => {},
};

export default NotificationMessage;
