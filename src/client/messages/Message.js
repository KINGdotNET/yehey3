import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import BTooltip from '../components/BTooltip';
import { remarkable } from '../components/Story/Body.js';
import BodyContainer from '../containers/Story/BodyContainer';
import {
  injectIntl,
  FormattedMessage,
  FormattedRelative,
  FormattedDate,
  FormattedTime,
} from 'react-intl';

class Message extends React.Component {

  static propTypes = {
    sender: PropTypes.string,
    recipient: PropTypes.string,
    messageText: PropTypes.string,
    time: PropTypes.number,
    id: PropTypes.string,
    username: PropTypes.string,
  };

  static defaultProps = {
    sender: '',
    recipient: '',
    messageText: '',
    time: 0,
    id: '',
    username: '',
  };

  scrollToBottom = (ref) => {
    this.refs[ref].scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
      this.scrollToBottom(this.props.id);
  }

  render() {
    const { 
      sender, 
      recipient, 
      messageText, 
      time, 
      id, 
      username
    } = this.props;

    const ownMessage = (sender == username);
    const alignClass = ownMessage ? "Message Left" : "Message Right";
    const messageBodyHTML = remarkable.render(messageText);

    return (
      <div className={alignClass} ref={this.props.id}>
        <div className="Message__avatar">
            <Avatar username={sender} size={30} />
        </div>
        <div className="Message__content">
          <h4 className="Message__text">
            <BodyContainer body={messageBodyHTML} />
          </h4>
          <div className="Message__time">
            <BTooltip
              title={
                <span>
                  <FormattedDate value={time} />{' '}
                  <FormattedTime value={time} />
                </span>
              }>
              <span>
                <FormattedRelative value={time} />
              </span>
            </BTooltip>
          </div>
        </div>
      </div>
      );
    }
  };

export default Message;
