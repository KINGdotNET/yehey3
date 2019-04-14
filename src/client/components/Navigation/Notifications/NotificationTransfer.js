import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router-dom';
import Avatar from '../../Avatar';
import { epochToUTC, jsonParse } from '../../../helpers/formatter';
import './Notification.less';
import { createEventHandler } from 'recompose';
import { Checkbox, Form, Input, Select, Button } from 'antd';



const NotificationTransfer = ({ 
  notification, 
  read,
  onClick,
  onRequestClick,
  }) => { 

    const transferMemo = jsonParse(notification.memo);
    let transferType = 'transfer';
    
    if (transferMemo) {
      transferType = transferMemo.type ? transferMemo.type : 'transfer';
    }

    if (transferType == 'transfer') return(
    <Link
      to="/wallet"
      className={classNames('Notification', {
        'Notification--unread': !read,
      })}
      onClick={onClick}
    >
      <Avatar username={notification.from} size={40} />
      <div className="Notification__text">
        <div className="Notification__text__message">
          <FormattedMessage
            id="notification_transfer_username_amount"
            defaultMessage="{username} transfered {amount} to you"
            values={{
              username: <span className="username">{notification.from}</span>,
              amount: notification.amount,
            }}
          />
        </div>
        <div className="Notification__text__date">
          <FormattedRelative value={epochToUTC(notification.timestamp)} />
        </div>
      </div>
    </Link> ); 

    const transferQuery = {
      to: transferMemo.to,
      amount: transferMemo.amount,
      memo: transferMemo.memo,
    };

    if (transferType == 'request') return(
      <div className={classNames('Notification', {
        'Notification--unread': !read,
      })}>
        <Link
          to="/wallet"
          onClick={onClick}
        >
          <Avatar username={notification.from} size={40} />
          <div className="Notification__text">
            <div className="Notification__text__message">
              <FormattedMessage
                id="notification_request_username_amount"
                defaultMessage="{username} has requested a payment of {amount}"
                values={{
                  username: <span className="username">{notification.from}</span>,
                  amount: transferQuery.amount,
                }}
              />
              
            </div>
            <div className="Notification__text__date">
              <FormattedRelative value={epochToUTC(notification.timestamp)} />
            </div>
          </div>
        </Link>
        <Button onClick={(e) => onRequestClick(e, transferQuery)}> 
          <FormattedMessage
          id="notification_accept_request"
          defaultMessage="Pay {amount} to {username}"
          values={{
            username: <span className="username">{notification.from}</span>,
            amount: transferQuery.amount,
          }}
          />
        </Button>
    </div> ); 
    
  }

  NotificationTransfer.propTypes = {
    read: PropTypes.bool,
    notification: PropTypes.shape({
    follower: PropTypes.string,
    timestamp: PropTypes.number,
    }),
    onClick: PropTypes.func,
    onRequestClick: PropTypes.func,
    onActionInitiated: PropTypes.func,
  };
  
  NotificationTransfer.defaultProps = {
    read: false,
    notification: {},
    onClick: () => {},
    onRequestClick: () => {},
  };

export default NotificationTransfer;
