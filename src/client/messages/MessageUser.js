import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import BTooltip from '../components/BTooltip';
import BodyShort from '../components/Story/BodyShort';
import ellipsis from 'text-ellipsis';
import {
  injectIntl,
  FormattedMessage,
  FormattedRelative,
  FormattedDate,
  FormattedTime,
} from 'react-intl';

class MessageUser extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    messageText: PropTypes.string,
    time: PropTypes.number,
    id: PropTypes.string,
    userSent: PropTypes.bool,
    newContact: PropTypes.bool,
  };

  static defaultProps = {
    name: '',
    messageText: '',
    time: 0,
    id: '',
    userSent: false,
    newContact: false,
  };

  render() {
    const { 
      name,
      messageText, 
      time, 
      id, 
      userSent,
      newContact,
    } = this.props;

    const messageBody = ellipsis(messageText, 100, { ellipsis: '…' })
    const messageClass = newContact ? "MessageUser__text newContact" : "MessageUser__text"

    return (
      <div className="MessageUser">
        <Link to={`/messages/@${name}`} >
          <div className="MessageUser__container" >
            <div className="MessageUser__avatar">
              <Avatar username={name} size={50} />
            </div>
            <div className="MessageUser__content">
              <div className="MessageUser__name">
                <h2>
                  {name}
                </h2>
              </div>
              <h4 className={messageClass}>
                {userSent && "You: "}{messageBody}
              </h4>
              {!newContact && (
                <div className="MessageUser__time">
                <BTooltip
                  title={
                    <span>
                      <FormattedDate value={time} />{' '}
                      <FormattedTime value={time} />
                    </span>}>
                  <span>
                    <FormattedRelative value={time} />
                  </span>
                </BTooltip>
              </div>
              )}
            </div>
          </div>
        </Link>
      </div>
      );
    }
  };

export default MessageUser;
