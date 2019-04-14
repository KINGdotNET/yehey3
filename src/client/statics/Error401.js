import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import weauthjsInstance from '../weauthjsInstance';
import { Checkbox, Form, Input, Select, Button } from 'antd';
import './ErrorPage.less';

const Error401 = ({ staticContext }) => {
  if (staticContext) {
    staticContext.status = 401; // eslint-disable-line no-param-reassign
  }
  return (
    <div className="ErrorPage container">
      <h1>
        <FormattedMessage id="page_forbidden" defaultMessage="You are now logged out." />
      </h1>
      <h2>
        <FormattedMessage
          id="page_forbidden_message"
          defaultMessage="Please to login to use this page."
        />
      </h2>
      <p>
      <Button>
          <a href={weauthjsInstance.getLoginURL()}>
            <FormattedMessage id="homepage_link_text" defaultMessage="Login" />
          </a>
      </Button>
      </p>
      <p>
        <Button>
          <Link to="/trending-all/hot-all">
            <FormattedMessage id="homepage" defaultMessage="Return to the Homepage" />
          </Link>
        </Button>
      </p>
    </div>
  );
};

Error401.propTypes = {
  staticContext: PropTypes.shape(),
};

Error401.defaultProps = {
  staticContext: null,
};

export default withRouter(Error401);
