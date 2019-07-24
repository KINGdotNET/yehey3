import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message } from 'antd';
import { injectIntl } from 'react-intl';
import { getAuthenticatedUser } from '../../reducers';
import { MAXIMUM_UPLOAD_SIZE_HUMAN } from '../../helpers/image';
import { WeYouMe_PassPik_ImageHash } from '../../helpers/imageHash'

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function withEditor(WrappedComponent) {
  @connect(state => ({
    user: getAuthenticatedUser(state),
  }))
  @injectIntl
  class EditorBase extends React.Component {
    static displayName = `withEditor(${getDisplayName(WrappedComponent)})`;

    static propTypes = {
      intl: PropTypes.shape().isRequired,
      user: PropTypes.shape().isRequired,
    };

    handleImageUpload = (blob, callback, errorCallback) => {
      const { intl: { formatMessage } } = this.props;
      // message.info(
      //   formatMessage({ id: 'notify_uploading_image', defaultMessage: 'Uploading image' }),
      // );
      const formData = new FormData();
      formData.append('file', blob);
      fetch(`https://ipfs.busy.org/upload`, {
        method: 'POST',
        body: formData,
      })
      .then(res => res.json())
      .then(res => callback(res.url, blob.name))
      .catch(err => {
        console.log('err', err);
        errorCallback();
        message.error(
          formatMessage({
            id: 'notify_uploading_iamge_error',
            defaultMessage: "Image Upload Error",
          }),
        );
      });
    };

    handleImageHash = (blob, callback) => 
      WeYouMe_PassPik_ImageHash(blob, callback);

    handleImageInvalid = () => {
      const { formatMessage } = this.props.intl;
      message.error(
        formatMessage(
          {
            id: 'notify_uploading_image_invalid',
            defaultMessage:
              'This file is invalid. Only image files with maximum size of {size} are supported',
          },
          { size: MAXIMUM_UPLOAD_SIZE_HUMAN },
        ),
      );
    };

    render() {
      return (
        <WrappedComponent
          onImageUpload={this.handleImageUpload}
          onImageHash={this.handleImageHash}
          onImageInvalid={this.handleImageInvalid}
          {...this.props}
        />
      );
    }
  }

  return EditorBase;
}
