import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';

const NSFWStoryPreviewMessage = ({ onClick }) => (
  <div className="Story__warning__message">
    <h4>
      <FormattedMessage
        id="post_preview_hidden_for_nsfw"
        defaultMessage="This post is tagged NSFW 😉"
      />
      <br />
      <Button role="presentation" onClick={onClick}>
        <FormattedMessage id="display_post_preview" defaultMessage="Display post preview" />
      </Button>
    </h4>
  </div>
);

NSFWStoryPreviewMessage.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default NSFWStoryPreviewMessage;
