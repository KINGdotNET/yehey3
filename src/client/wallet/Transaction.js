import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import { connect } from 'react-redux';
import Affix from '../components/Utils/Affix';
import './Transaction.less';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  getTransactionByID,
  getLoadingTransactionByID
} from '../reducers';
import {
  getTransaction,
} from '../wallet/walletActions';
import { Link } from 'react-router-dom';

@withRouter
@connect(
  (state, ownProps) => ({
    transaction: getTransactionByID(state, ownProps.match.params.txid),
    loading: getLoadingTransactionByID(state),
  }),
  {
    getTransaction,
  },
)

class Transaction extends React.Component {
  static propTypes = {
    match: PropTypes.shape().isRequired,
    transaction: PropTypes.shape(),
    getTransaction: PropTypes.func.isRequired,
  };
  
  static defaultProps = {
      getTransaction: () => {},
  };

  static fetchData({ store, match }) {
    const { txid } = match.params;
    return Promise.all([
      store.dispatch(getTransaction(txid)),
    ]);
  }
  
  displayTransaction() {
    const blockNum = this.props.transaction.block_num;
    const Operations = JSON.stringify(this.props.transaction.operations);
    const transactionID = this.props.transaction.transaction_id;
    return (
        <div className="Transaction__block"> 
            <h4>Transaction ID: {transactionID} </h4> 
            <h4 className="Block__number">
        Block Number: <Link to={`/block/${blockNum}`}> {blockNum}</Link>
        </h4> 
            <h4>Operations: {Operations} </h4> 
        </div>
    )
  };

  componentDidMount() {
    const {
      transaction,
      match,
    } = this.props;
    const { txid } = match.params;
    
    if (_.isEmpty(transaction) ) {
      this.props.getTransaction(txid);
    }
  }

  render() {
  
    return (
     
    <div className="shifted">
      <Helmet>
        <title>
          WeYouMe Transaction Details
        </title>
      </Helmet>
      <div className="feed-layout container">
        <Affix className="leftContainer" stickPosition={77}>
          <div className="left">
            <LeftSidebar />
          </div>
        </Affix>
        <div className="center">
        <div className="Transaction">
          <div className="Transaction__title">
            <h3>
              <FormattedMessage id="transaction_details" defaultMessage="Transaction Details" />
            </h3>
          </div>
          </div>
          <div className="Transaction__content">
            {this.displayTransaction()}
          </div>
        </div>
        <Affix className="rightContainer" stickPosition={77}>
          <div className="right">
          <RightSidebar />
              </div>
              </Affix>
      </div>
    </div>
    );
  }
}



export default Transaction;
