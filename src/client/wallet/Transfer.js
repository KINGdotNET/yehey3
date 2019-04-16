import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { Form, Input, Radio, Modal } from 'antd';
import { TME, TSD } from '../../common/constants/cryptos';
import blockchainAPI from '../blockchainAPI';
import weauthjsInstance from '../weauthjsInstance';
import { getCryptoPriceHistory } from '../app/appActions';
import { closeTransfer } from './walletActions';
import {
  getIsAuthenticated,
  getAuthenticatedUser,
  getIsTransferVisible,
  getTransferTo,
  getTransferAmount,
  getTransferMemo,
  getTransferCurrency,
  getTransferType,
  getCryptosPriceHistory,
} from '../reducers';
import './Transfer.less';

const InputGroup = Input.Group;

@injectIntl
@connect(
  state => ({
    visible: getIsTransferVisible(state),
    to: getTransferTo(state),
    amount: getTransferAmount(state),
    memo: getTransferMemo(state),
    currency: getTransferCurrency(state),
    type: getTransferType(state),
    authenticated: getIsAuthenticated(state),
    user: getAuthenticatedUser(state),
    cryptosPriceHistory: getCryptosPriceHistory(state),
  }),
  {
    closeTransfer,
    getCryptoPriceHistory,
  },
)
@Form.create()
export default class Transfer extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    visible: PropTypes.bool,
    to: PropTypes.string,
    amount: PropTypes.number,
    memo: PropTypes.string,
    currency: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    authenticated: PropTypes.bool.isRequired,
    user: PropTypes.shape().isRequired,
    form: PropTypes.shape().isRequired,
    cryptosPriceHistory: PropTypes.shape().isRequired,
    getCryptoPriceHistory: PropTypes.func.isRequired,
    closeTransfer: PropTypes.func,
  };

  static defaultProps = {
    to: '',
    amount: 0,
    memo: '',
    currency: 'TME',
    type: 'transfer',
    visible: false,
    closeTransfer: () => {},
  };

  static amountRegex = /^[0-9]*\.?[0-9]{0,3}$/;

  static minAccountLength = 3;
  static maxAccountLength = 16;
  static exchangeRegex = /^(bittrex|blocktrades|poloniex|changelly|openledger|shapeshiftio|deepcrypto8)$/;
  static CURRENCIES = {
    TME: 'TME',
    TSD: 'TSD',
  };

  state = {
    currency: this.props.currency,
    type: this.props.type,
    oldAmount: undefined,
  };

  componentDidMount() {
    const { cryptosPriceHistory } = this.props;
    const currentTMERate = _.get(cryptosPriceHistory, 'TME.priceDetails.currentUSDPrice', null);
    const currentTSDRate = _.get(cryptosPriceHistory, 'TSD.priceDetails.currentUSDPrice', null);

    if (_.isNull(currentTMERate)) {
      this.props.getCryptoPriceHistory(TME.symbol);
    }

    if (_.isNull(currentTSDRate)) {
      this.props.getCryptoPriceHistory(TSD.symbol);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { form, to, amount, memo, currency, type } = nextProps;
    if (this.props.to != to ||
      this.props.amount != amount || 
      this.props.memo != memo ||
      this.props.type != type || 
      this.props.currency != currency) {
      form.setFieldsValue({
        to,
        amount,
        currency,
        memo,
        type,
      });
      this.setState({
        currency,
        type,
      });
    }
  }

  getUSDValue() {
    const { cryptosPriceHistory, intl } = this.props;
    const { currency, oldAmount } = this.state;
    const currentTMERate = _.get(cryptosPriceHistory, 'TME.priceDetails.currentUSDPrice', null);
    const currentTSDRate = _.get(cryptosPriceHistory, 'TSD.priceDetails.currentUSDPrice', null);
    const TMErateLoading = _.isNull(currentTMERate) || _.isNull(currentTSDRate);
    const parsedAmount = parseFloat(oldAmount);
    const invalidAmount = parsedAmount <= 0 || _.isNaN(parsedAmount);
    let amount = 0;

    if (TMErateLoading || invalidAmount) return '';

    if (currency === TME.symbol) {
      amount = parsedAmount * parseFloat(currentTMERate);
    } else {
      amount = parsedAmount * parseFloat(currentTSDRate);
    }

    return `~ $${intl.formatNumber(amount, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  handleBalanceClick = event => {
    const { oldAmount } = this.state;
    const value = parseFloat(event.currentTarget.innerText);
    this.setState({
      oldAmount: Transfer.amountRegex.test(value) ? value : oldAmount,
    });
    this.props.form.setFieldsValue({
      amount: value,
    });
  };

  handleCurrencyChange = event => {
    const { form } = this.props;
    this.setState({ currency: event.target.value }, () =>
      form.validateFields(['amount'], { force: true }),
    );
  };

  handleTypeChange = event => {
    const { form } = this.props;
    this.setState({ type: event.target.value }, () =>
      form.validateFields(['type'], { force: true }),
    );
  };

  handleContinueClick = () => {
    const { form, user } = this.props;

    form.validateFields({ force: true }, (errors, values) => {
      if (!errors) {
        const transferQuery = {
          to: values.to,
          amount: `${parseFloat(values.amount).toFixed(3)} ${values.currency}`,
          memo: values.memo,
        };
        if (values.type == 'transfer') {
          const win = window.open(weauthjsInstance.sign('transfer', transferQuery), '_blank');
          win.focus();
          this.props.closeTransfer();
        }
        else if (values.type == 'request') {
          const requestData = {
            type: 'request',
            to: user.name,
            amount: `${parseFloat(values.amount).toFixed(3)} ${values.currency}`,
            memo: values.memo,
          }
          const requestQuery = {
            to: values.to,
            amount: `${parseFloat(0.001).toFixed(3)} ${values.currency}`,
            memo: JSON.stringify(requestData),
          }
          const win = window.open(weauthjsInstance.sign('transfer', requestQuery), '_blank');
          win.focus();
          this.props.closeTransfer();
        }
      }
    });
  };

  handleCancelClick = () => this.props.closeTransfer();

  handleAmountChange = event => {
    const { value } = event.target;
    const { oldAmount } = this.state;

    this.setState({
      oldAmount: Transfer.amountRegex.test(value) ? value : oldAmount,
    });
    this.props.form.setFieldsValue({
      amount: Transfer.amountRegex.test(value) ? value : oldAmount,
    });
    this.props.form.validateFields(['amount']);
  };

  validateMemo = (rule, value, callback) => {
    const { intl } = this.props;
    const recipientIsExchange = Transfer.exchangeRegex.test(this.props.form.getFieldValue('to'));

    if (recipientIsExchange && (!value || value === '')) {
      return callback([
        new Error(
          intl.formatMessage({
            id: 'memo_exchange_error',
            defaultMessage: 'Memo is required when sending to an exchange.',
          }),
        ),
      ]);
    } else if (value && value.trim()[0] === '#') {
      return callback([
        new Error(
          intl.formatMessage({
            id: 'memo_encryption_error',
            defaultMessage: 'Encrypted memos are not supported.',
          }),
        ),
      ]);
    }

    return callback();
  };

  validateUsername = (rule, value, callback) => {
    const { intl } = this.props;
    this.props.form.validateFields(['memo'], { force: true });

    if (!value) {
      callback();
      return;
    }

    if (value.length < Transfer.minAccountLength) {
      callback([
        new Error(
          intl.formatMessage(
            {
              id: 'username_too_short',
              defaultMessage: 'Username {username} is too short.',
            },
            {
              username: value,
            },
          ),
        ),
      ]);
      return;
    }
    if (value.length > Transfer.maxAccountLength) {
      callback([
        new Error(
          intl.formatMessage(
            {
              id: 'username_too_long',
              defaultMessage: 'Username {username} is too long.',
            },
            {
              username: value,
            },
          ),
        ),
      ]);
      return;
    }
    blockchainAPI.sendAsync('get_accounts', [[value]]).then(result => {
      if (result[0]) {
        callback();
      } else {
        callback([
          new Error(
            intl.formatMessage(
              {
                id: 'to_error_not_found_username',
                defaultMessage: "Couldn't find user with name {username}.",
              },
              {
                username: value,
              },
            ),
          ),
        ]);
      }
    }).catch(err=>{console.error('err', err)});
  };

  validateBalance = (rule, value, callback) => {
    const { intl, authenticated, user } = this.props;

    const currentValue = parseFloat(value);

    if (value && currentValue <= 0) {
      callback([
        new Error(
          intl.formatMessage({
            id: 'amount_error_zero',
            defaultMessage: 'Amount has to be higher than 0.',
          }),
        ),
      ]);
      return;
    }

    const selectedBalance =
      this.state.currency === Transfer.CURRENCIES.TME ? user.balance : user.TSDbalance;

    if (authenticated && currentValue !== 0 && currentValue > parseFloat(selectedBalance)) {
      callback([
        new Error(
          intl.formatMessage({ id: 'amount_error_funds', defaultMessage: 'Insufficient funds.' }),
        ),
      ]);
    } else {
      callback();
    }
  };

  getModalTitle = (type, intl) => {
    if(type == 'transfer') {
      return (intl.formatMessage({ id: 'transfer_modal_title', defaultMessage: 'Transfer funds' }));
    }
    else if (type == 'request') {
      return (intl.formatMessage({ id: 'transfer_modal_title_request', defaultMessage: 'Request funds' }));
    }
  };

  getUsernameTitle = (type, intl) => {
    if(type == 'transfer') {
      return (intl.formatMessage({ id: 'transfer_to', defaultMessage: 'To' }));
    }
    else if (type == 'request') {
      return (intl.formatMessage({ id: 'transfer_from', defaultMessage: 'Request from' }));
    }
  };

  render() {
    const { intl, visible, authenticated, user } = this.props;
    const { getFieldDecorator } = this.props.form;

    const balance =
      this.state.currency === Transfer.CURRENCIES.TME ? user.balance : user.TSDbalance;

    const currencyPrefix = getFieldDecorator('currency', {
      initialValue: this.state.currency,
    })(
      <Radio.Group onChange={this.handleCurrencyChange} className="Transfer__amount__type">
        <Radio.Button value={Transfer.CURRENCIES.TME}>{Transfer.CURRENCIES.TME}</Radio.Button>
        <Radio.Button value={Transfer.CURRENCIES.TSD}>{Transfer.CURRENCIES.TSD}</Radio.Button>
      </Radio.Group>,
    );

    const transferType= getFieldDecorator('type', {
      initialValue: this.state.type,
    })(
      <Radio.Group onChange={this.handleTypeChange} className="Transfer__type__setting">
        <Radio.Button value={'transfer'}>{'send'}</Radio.Button>
        <Radio.Button value={'request'}>{'request'}</Radio.Button>
      </Radio.Group>,
    );

    const usdValue = this.getUSDValue();

    //const modalTitle = this.getModalTitle(this.state.type, intl);

    //const usernameTitle = this.getUsernameTitle(this.state.type, intl);

    return (
      <Modal
        visible={visible}
        title={this.getModalTitle(this.state.type, intl)}
        okText={intl.formatMessage({ id: 'continue', defaultMessage: 'Continue' })}
        cancelText={intl.formatMessage({ id: 'cancel', defaultMessage: 'Cancel' })}
        onOk={this.handleContinueClick}
        onCancel={this.handleCancelClick}
      >
        <Form className="Transfer" hideRequiredMark>

          
          <Form.Item label={<FormattedMessage id="to_message" defaultMessage={this.getUsernameTitle(this.state.type, intl)} />}>
            {getFieldDecorator('to', {
              rules: [
                {
                  required: true,
                  message: intl.formatMessage({
                    id: 'to_error_empty',
                    defaultMessage: 'Recipient is required.',
                  }),
                },
                { validator: this.validateUsername },
              ],
            })(
              <Input
                type="text"
                placeholder={intl.formatMessage({
                  id: 'to_placeholder',
                  defaultMessage: 'Payment Recipient:',
                })}
              />,
            )}
          </Form.Item>
          <Form.Item label={<FormattedMessage id="amount" defaultMessage="Amount" />}>
            <InputGroup className="Transfer__amount">
              {getFieldDecorator('amount', {
                trigger: '',
                rules: [
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'amount_error_empty',
                      defaultMessage: 'Amount is required.',
                    }),
                  },
                  {
                    pattern: Transfer.amountRegex,
                    message: intl.formatMessage({
                      id: 'amount_error_format',
                      defaultMessage:
                        'Incorrect format. Use comma or dot as decimal separator. Use at most 3 decimal places.',
                    }),
                  },
                  { validator: this.validateBalance },
                ],
              })(
                <Input
                  className="Transfer__amount__input"
                  onChange={this.handleAmountChange}
                  placeholder={intl.formatMessage({
                    id: 'amount_placeholder',
                    defaultMessage: "Transfer amount",
                  })}
                />,
              )}
              <Input
                className="Transfer__usd-value"
                addonAfter={currencyPrefix}
                placeholder={usdValue}
              />
            </InputGroup>
            {authenticated && (
              <FormattedMessage
                id="balance_amount"
                defaultMessage="Your balance: {amount}"
                values={{
                  amount: (
                    <span role="presentation" onClick={this.handleBalanceClick} className="balance">
                      {balance}
                    </span>
                  ),
                }}
              />
            )}
          </Form.Item>
          <Form.Item label={<FormattedMessage id="memo" defaultMessage="Memo" />}>
            {getFieldDecorator('memo', {
              rules: [{ validator: this.validateMemo }],
            })(
              <Input.TextArea
                autosize={{ minRows: 2, maxRows: 6 }}
                placeholder={intl.formatMessage({
                  id: 'memo_placeholder',
                  defaultMessage: 'Additional message to include in this payment (optional)',
                })}
              />,
            )}
          </Form.Item>
          <Form.Item label={<FormattedMessage id="type" defaultMessage="Type" />}>
            {transferType}
          </Form.Item>
        </Form>
        <FormattedMessage
          id="transfer_modal_info"
          defaultMessage="Click the button below to be redirected to WeAuth to complete your transaction."
        />
      </Modal>
    );
  }
}
