import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from '../helpers/image';
import { Input, Form, Button, Icon } from 'antd';
import withEditor from '../components/Editor/withEditor';
import classNames from 'classnames';
import withAuthActions from '../auth/withAuthActions';

import './MessageEditor.less';

@withEditor
@injectIntl
@withAuthActions
class MessageEditor extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    username: PropTypes.string.isRequired,
    recipient: PropTypes.string.isRequired,
    submitted: PropTypes.bool,
    onActionInitiated: PropTypes.func.isRequired,
    inputValue: PropTypes.string.isRequired,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
    onSubmit: PropTypes.func,
    inputId: PropTypes.string,
    onTransferClick: PropTypes.func,
  };

  static defaultProps = {
    isLoading: false,
    inputValue: '',
    submitted: false,
    onImageUpload: () => {},
    onImageInvalid: () => {},
    onSubmit: () => {},
    onTransferClick: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      body: '',
      imageUploading: false,
      image: '',
    };

    this.setInput = this.setInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTransferClick = this.handleTransferClick.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleSendImage = this.handleSendImage.bind(this);
  }

  componentDidMount() {
    if (this.input && !this.props.top) {
      this.input.focus();
    }
  }

  setInput(input) {
    this.input = input;
  }

  handleUpdateCurrentInputValue = e =>
    this.setState({
      body: e.target.value,
    });
  
  handleTransferClick = () => {
    this.props.onActionInitiated(this.onTransferClick);
  }

  onTransferClick = () => {
    this.props.onTransferClick(this.props.recipient);
  }

  handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
      if (!isValidImage(e.target.files[0])) {
        this.props.onImageInvalid();
        return;
      }

      this.setState({
        imageUploading: true,
      });

      this.props.onImageUpload(e.target.files[0], this.handleSendImage, () =>
        this.setState({
          imageUploading: false,
        }),
      );
      e.target.value = '';
    }
  }

  handleSendImage(image, imagename) {
    this.setState({
      imageUploading: false,
      image: image,
    });
    if (this.state.image) {
      this.props.onSubmit(this.props.recipient, this.state.image);
      this.setState({
        image: '',
      });
    }
  }

  handleSubmit(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.state.body) {
      this.props.onSubmit(this.props.recipient, this.state.body);
      this.setState({
        body:'',
      });
      const form = document.getElementById("MessageForm");
      form.reset();
    }
  }

  render() {
    const { intl, recipient, inputId } = this.props;
    const inputMinRows = 1;
    const sendClass = classNames({ active: false, Buttons__link: true});
    return (
      <div className="MessageEditor">
        <div className="MessageEditor__container" >
          <div className="MessageEditor__button" >
            <a role ="presentation" className={sendClass} onClick={this.handleTransferClick}>
              <i className="iconfont icon-Dollar" />
            </a>
          </div>
          <div className="MessageEditor__imagebox" >
            <input
              type="file"
              id={inputId}
              accept="image/*"
              onChange={this.handleImageChange}
            />
            <label htmlFor={inputId} >
              {this.state.imageUploading ? (
                <Icon type="loading"/>
              ) : (
                <i className="iconfont icon-picture" />
              )}
            </label>
          </div>
          <Form className="MessageEditor__form" id="MessageForm"> 
            <Input.TextArea
              style={{border:'none', width:'100%'}}
              autosize={{ minRows: inputMinRows, maxRows: 3 }}
              onChange={this.handleUpdateCurrentInputValue}
              onPressEnter={this.handleSubmit}
              ref={this.setInput}
              placeholder={intl.formatMessage({
                id: 'write_message',
                defaultMessage: 'Message:',
              })}
              value={this.state.body}
              maxLength="1000"
            />
          </Form>
        </div>
      </div>
    );
  }
}

export default MessageEditor;
