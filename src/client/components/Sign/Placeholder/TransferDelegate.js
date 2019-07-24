import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import Avatar from '../../Avatar';
import './TransferDelegate.less';

const SignPlaceholderDefault = ({
  query,
}) => {
  let amount;
  let symbol;
  if (query.amount) {
    [amount, symbol] = query.amount.split(' ');
  }
  return (
    <div className="Placeholder__operation-content">
      <div className="TransferInfo">
        <div className="TransferInfo__accounts">
          <div className="TransferInfo__account">
            <Avatar username={query.currentUserName} size={100} className="TransferInfo__avatar" />
            <span className="TransferInfo__username">
              {query.from || <FormattedMessage id="you" />}
            </span>
          </div>
          <i className="iconfont icon-enter" />
          {/* <span className="TransferInfo__dots" /> */}
          <div className="TransferInfo__account">
            <Avatar username={query.to} size={100} className="TransferInfo__avatar" />
            <span className="TransferInfo__username">
              {query.to}
            </span>
          </div>
        </div>
        {amount &&
        <strong>
          <FormattedNumber
            value={amount}
            currency="USD"
            minimumFractionDigits={3}
            maximumFractionDigits={3}
          /> {symbol}
        </strong>}
        {query.memo && <span className="Placeholder__memo">{query.memo}</span>}
      </div>
    </div>
  );
};

SignPlaceholderDefault.propTypes = {
  query: PropTypes.shape(),
};

export default SignPlaceholderDefault;
