import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { Icon, Input } from 'antd';
import Dropzone from 'react-dropzone';
import { HotKeys } from 'react-hotkeys';
import { MAXIMUM_UPLOAD_SIZE, isValidImage } from '../../helpers/image';
import './ImageInput.less';

class ImageInput extends React.Component {
  static propTypes = {
    value: PropTypes.string, // eslint-disable-line react/require-default-props
    inputId: PropTypes.string,
    addon: PropTypes.node,
    inputRef: PropTypes.func,
    onChange: PropTypes.func,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
  };

  static defaultProps = {
    addon: null,
    inputId: '',
    inputRef: () => {},
    onChange: () => {},
    onImageUpload: () => {},
    onImageInvalid: () => {},
  };


  constructor(props) {
    super(props);

    this.state = {
      imageUploading: false,
      dropzoneActive: false,
    };

    this.setInput = this.setInput.bind(this);
    this.disableAndInsertImage = this.disableAndInsertImage.bind(this);
    this.handlePastedImage = this.handlePastedImage.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    if (this.input) {
      this.input.addEventListener('paste', this.handlePastedImage);
    }
  }

  setInput(input) {
    if (input) {
      this.originalInput = input;
      // eslint-disable-next-line react/no-find-dom-node
      this.input = ReactDOM.findDOMNode(input);
      this.props.inputRef(this.input);
    }
  }

  setValue(value, start, end) {
    this.props.onChange(value);
    if (start && end) {
      setTimeout(() => {
        this.input.setSelectionRange(start, end);
      }, 0);
    }
  }

  insertAtCursor(before, after, deltaStart = 0, deltaEnd = 0) {
    if (!this.input) return;

    const { value } = this.props;

    const startPos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const newValue =
      value.substring(0, startPos) +
      before +
      value.substring(startPos, endPos) +
      after +
      value.substring(endPos, value.length);

    this.setValue(newValue, startPos + deltaStart, endPos + deltaEnd);
  }

  disableAndInsertImage(image, imageName = 'image') {
    this.setState({
      imageUploading: false,
    });
    this.insertImage(image, imageName);
  }

  insertImage(image, imageName = 'image') {
    if (!this.input) return;

    const { value } = this.props;

    const startPos = this.input.selectionStart;
    const endPos = this.input.selectionEnd;
    const imageText = `${image}`;
    const newValue = `${value.substring(0, startPos)}${imageText}${value.substring(
      endPos,
      value.length,
    )}`;
    this.resizeTextarea();
    this.setValue(newValue, startPos + imageText.length, startPos + imageText.length);
  }

  resizeTextarea() {
    if (this.originalInput) this.originalInput.resizeTextarea();
  }

  handlers = {
    
  };

  handlePastedImage(e) {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      Array.from(items).forEach(item => {
        if (item.kind === 'file') {
          e.preventDefault();

          const blob = item.getAsFile();

          if (!isValidImage(blob)) {
            this.props.onImageInvalid();
            return;
          }

          this.setState({
            imageUploading: true,
          });

          this.props.onImageUpload(blob, this.disableAndInsertImage, () =>
            this.setState({
              imageUploading: false,
            }),
          );
        }
      });
    }
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

      this.props.onImageUpload(e.target.files[0], this.disableAndInsertImage, () =>
        this.setState({
          imageUploading: false,
        }),
      );
      e.target.value = '';
    }
  }

  handleDrop(files) {
    if (files.length === 0) {
      this.setState({
        dropzoneActive: false,
      });
      return;
    }

    this.setState({
      dropzoneActive: false,
      imageUploading: true,
    });
    let callbacksCount = 0;
    Array.from(files).forEach(item => {
      this.props.onImageUpload(
        item,
        (image, imageName) => {
          callbacksCount += 1;
          this.insertImage(image, imageName);
          if (callbacksCount === files.length) {
            this.setState({
              imageUploading: false,
            });
          }
        },
        () => {
          this.setState({
            imageUploading: false,
          });
        },
      );
    });
  }

  handleDragEnter() {
    this.setState({ dropzoneActive: true });
  }

  handleDragLeave() {
    this.setState({ dropzoneActive: false });
  }

  handleChange(e) {
    const { value } = e.target;
    this.setValue(value);
  }

  render() {
    const {
      addon,
      value,
      inputId,
      inputRef,
      onImageUpload,
      onImageInvalid,
      ...restProps
    } = this.props;
    const { dropzoneActive } = this.state;

    return (
      <React.Fragment>
        <div className="ImageInput__dropzone-base">
          <Dropzone
            disableClick
            style={{}}
            accept="image/*"
            maxSize={MAXIMUM_UPLOAD_SIZE}
            onDropRejected={this.props.onImageInvalid}
            onDrop={this.handleDrop}
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
          >
          <p className="ImageInput__imagebox">
          <input
            type="file"
            id={this.props.inputId || 'inputfile'}
            accept="image/*"
            onChange={this.handleImageChange}
          />
          <label htmlFor={this.props.inputId || 'inputfile'}>
            {this.state.imageUploading ? (
              <Icon type="loading" />
            ) : (
              <i className="iconfont icon-picture" />
            )}
            {this.state.imageUploading ? (
              <FormattedMessage id="image_uploading" defaultMessage="Uploading your image..." />
            ) : (
              <FormattedMessage
                id="select_or_past_image"
                defaultMessage="Select image or paste it from the clipboard."
              />
            )}
          </label>
        </p>
            {dropzoneActive && (
              <div className="ImageInput__dropzone">
                <div>
                  <i className="iconfont icon-picture" />
                  <FormattedMessage id="drop_image" defaultMessage="Drop your images here" />
                </div>
              </div>
            )}
            <HotKeys keyMap={this.constructor.hotkeys} handlers={this.handlers}>
              <Input.TextArea
                {...restProps}
                onChange={this.handleChange}
                value={value}
                ref={this.setInput}
              />
            </HotKeys>
          </Dropzone>
        </div>
        
      </React.Fragment>
    );
  }
}

export default ImageInput;