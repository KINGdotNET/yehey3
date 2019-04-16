import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { openTransfer, openPowerUpOrDown } from '../../wallet/walletActions';
import { getAuthenticatedUser } from '../../reducers';
import { TME, TSD } from '../../../common/constants/cryptos';
import Action from '../Button/Action';
import ClaimRewardsBlock from '../../wallet/ClaimRewardsBlock';
import CryptoTrendingCharts from './CryptoTrendingCharts';
import './WalletSidebar.less';

@withRouter
@connect(
  state => ({
    user: getAuthenticatedUser(state),
  }),
  {
    openTransfer,
    openPowerUpOrDown,
  },
)
class WalletSidebar extends React.Component {
  static propTypes = {
    user: PropTypes.shape(),
    isCurrentUser: PropTypes.bool,
    match: PropTypes.shape().isRequired,
    openTransfer: PropTypes.func.isRequired,
		openPowerUpOrDown: PropTypes.func.isRequired,
		showPowerControls: PropTypes.any,
		showTransferControls: PropTypes.any,
		showMarket: PropTypes.any,
		showEarnings: PropTypes.any,
  };

  static defaultProps = {
    user: {},
		isCurrentUser: false,
		showPowerControls: true,
		showTransferControls: true,
		showMarket: true,
		showEarnings: true,
  };

  handlePaymentRequest = () => {
    const { match, user, isCurrentUser } = this.props;
    const username = match.params.name === user.name || isCurrentUser ? '' : match.params.name;
    this.transfer = {
      to: username,
      amount: 0,
      memo: " ",
      currency: 'TME',
      type: 'request',
    };
    this.props.openTransfer(this.transfer);
  };

  handleOpenTransfer = () => {
    const { match, user, isCurrentUser } = this.props;
    const username = match.params.name === user.name || isCurrentUser ? '' : match.params.name;
    this.transfer = {
      to: username,
      amount: 0,
      memo: " ",
      currency: 'TME',
      type: 'transfer',
    };
    this.props.openTransfer(this.transfer);
  };

  handleOpenPowerUp = () => {
    this.props.openPowerUpOrDown();
  };

  handleOpenPowerDown = () => {
    this.props.openPowerUpOrDown(true);
  };

  render() {
    const { match, user, isCurrentUser, showPowerControls, showTransferControls, showMarket, showEarnings } = this.props;
    const ownProfile = match.params.name === user.name || isCurrentUser;
    const cryptos = [TME.symbol, TSD.symbol];

    return (
      <div className="WalletSidebar">
        <div className="WalletSidebar__walletbutton">
          <Action primary className="WalletSidebar__actionbutton" onClick={this.handleOpenTransfer}>
            <FormattedMessage id="send" defaultMessage="Send" />
          </Action>
        </div>
        <div className="WalletSidebar__walletbutton">
            <Action primary className="WalletSidebar__actionbutton" onClick={this.handlePaymentRequest}>
              <FormattedMessage id="request" defaultMessage="Request" />
            </Action>
        </div>
        {ownProfile && (
          <div className="WalletSidebar__walletbutton">
            <Action primary className="WalletSidebar__actionbutton" onClick={this.handleOpenPowerUp}>
              <FormattedMessage id="power_up" defaultMessage="Power up" />
            </Action>
          </div>)}
        {ownProfile && (
          <div className="WalletSidebar__walletbutton">
            <Action primary className="WalletSidebar__actionbutton" onClick={this.handleOpenPowerDown}>
              <FormattedMessage id="power_down" defaultMessage="Power down" />
            </Action>
          </div>)}
				{ showMarket && 
        <CryptoTrendingCharts cryptos={cryptos} />
				}
        {ownProfile && <ClaimRewardsBlock />}
      </div>
    );
  }
}

export default WalletSidebar;
