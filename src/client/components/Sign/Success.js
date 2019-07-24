import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default class Sign extends React.Component {
  static propTypes = {
    cb: PropTypes.string,
    result: PropTypes.shape({}).isRequired,
  }

  componentDidMount = () => {
    const cb = this.props.cb;
    if (cb) {
      setTimeout(() => {
        window.location.href = this.props.cb;
      }, 5000);
    }
  };

  render() {
    const { cb, result } = this.props;
    return (
      <div className="Sign__result-container">
        <div className="Sign__result-title-bg">
          <img src="/images/sign/success.svg" id="success-icon" />
        </div>
        <h2><FormattedMessage id="congratulations" /></h2>
        <h5><FormattedMessage id="success_operation_broadcasted" /></h5>
        {result.id &&
        <h5>
          <br />
          <FormattedMessage id="transaction_id" />:<br />
          <a href={`https://alpha.weyoume.io/tx/${result.id}`} target="_blank" rel="noreferrer noopener">
            {result.id}
          </a>
        </h5>}
        {cb && <p><FormattedMessage id="redirect_five_seconds" /></p>}
      </div>
    );
  }
}
