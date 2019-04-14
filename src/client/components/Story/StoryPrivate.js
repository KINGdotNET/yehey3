import React from 'react';
import { FormattedMessage } from 'react-intl';
import './StoryDeleted.less';

const StoryPrivate = () => (
  <div className="StoryDeleted">
    <h3>
      <FormattedMessage id="post_private" defaultMessage="This post is encrypted and private." />
    </h3>
  </div>
);

export default StoryPrivate;
