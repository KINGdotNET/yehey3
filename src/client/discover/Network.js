import React from 'react';
import PropTypes from 'prop-types';
import Block from './Block';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import { connect } from 'react-redux';
import Affix from '../components/Utils/Affix';
import './Network.less';
import { withRouter } from 'react-router-dom';
import formatter from '../helpers/blockchainProtocolFormatter';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import {
  getLoadingGlobalProperties,
  getBlocksByHead,
  getLoadingBlocksByHead,
  getTxnBlockByNumber, 
  getLoadingTxnBlockByNumber,
  getGlobalPropertiesObject,
} from '../reducers';
import {
  getGlobalProperties,
  getHeadBlocks,
  getTxnBlock,
} from '../wallet/walletActions';

@withRouter
@connect(
  (state, ownProps) => ({
    loadingGlobalProperties: getLoadingGlobalProperties(state),
    gProps: getGlobalPropertiesObject(state),
    blocks: getBlocksByHead(state),
    loadingHeadBlocks: getLoadingBlocksByHead(state),
    txnBlock: getTxnBlockByNumber(state, parseInt(1)),
    loadingTxnBlock: getLoadingTxnBlockByNumber(state),
  }),
  {
    getGlobalProperties,
    getHeadBlocks,
    getTxnBlock,
  },
)

class Network extends React.Component {

  constructor(props) {
    super(props);
    
    this.onBlockSearch= this.onBlockSearch.bind(this);
  }
  
  state = {
    TxnIDs: [],
  };

  static propTypes = {
    
    getGlobalProperties: PropTypes.func.isRequired,
    blocks: PropTypes.array.isRequired,
    getHeadBlocks: PropTypes.func.isRequired,
    txnBlock: PropTypes.shape().isRequired,
    getTxnBlock: PropTypes.func.isRequired,
    gProps: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
  };
  
  static defaultProps = {
      gProps: {head_block_id: '', head_block_number: 0, totalSCORE: '', pending_rewarded_SCOREvalueInTME: '', totalTMEfundForSCORE: '' },
      getHeadBlocks: () => {},
      getTxnBlock: () => {},
      getGlobalProperties: () => {},
      blocks: [],
      txnBlock: {},
      
  };

  static fetchData({ store }) {
    return Promise.all([
      store.dispatch(getHeadBlocks()),
      store.dispatch(getGlobalProperties()),
    ]);
  }
  
  displayNetwork() {

    const { 
      gProps,
     } = this.props;
    const { 
      TxnIDs,
     } = this.state;
    
    const TxnSet = [...new Set(TxnIDs)];
    const blockNum = gProps.head_block_number;
    const blockID = gProps.head_block_id;
    const SCOREFund = gProps.totalTMEfundForSCORE;
    const totalSCORE = gProps.totalSCORE;
    const pendingRewards = gProps.pending_rewarded_SCOREvalueInTME;
    const totalTME = gProps.current_supply;
    const totalTSD = gProps.current_TSD_supply;
    const showTxns = !(_.isEmpty(TxnIDs));
    return (
        <div className="Network__details">  
            <h3>Head Block Number:<Link to={`/block/${blockNum}`}> {blockNum} </Link> </h3> 
            <h4>Head Block ID: {blockID} </h4> 
            <h4>Total Score Fund: {formatter.numberWithCommas(SCOREFund)} </h4> 
            <h4>TME Supply: {formatter.numberWithCommas(totalTME)} </h4>
            <h4>TSD Supply: {formatter.numberWithCommas(totalTSD)} </h4>
            <h4>SCORE Supply: {formatter.numberWithCommas(totalSCORE)} </h4> 
            <h4>Pending Rewards: {formatter.numberWithCommas(pendingRewards)} </h4>
            <h4>Incoming New Transactions: {showTxns && TxnSet.map(txn => <Link to={`/tx/${txn}`}> {txn} </Link> )}</h4> 
        </div>
    )
  };

  onBlockSearch(e) {
    e.preventDefault();
    const newSearch = document.getElementById("BlockSearch");
    const form = document.getElementById("BlockForm");
    if (newSearch.value != "") {
      if (newSearch.value.match(/^[0-9]+$/)) {
        let blockSearchNumber = newSearch.value;
        this.props.history.push(`/block/${blockSearchNumber}`);
      }
    form.reset();
    }
  }

  blockSearch() {
    return (
      <div className="Network__blockSearch">
      <Form className="Network__form" id="BlockForm"> 
          <Input
          type="text"
          className="Network__input"
          id="BlockSearch"
          placeholder="Search Block number"
          />
          <Button onClick={this.onBlockSearch}> Find block number </Button>
      </Form>
      </div>
    ); 
  }

  componentDidMount() {
    if (_.isEmpty(this.props.gProps) ) {
      this.props.getGlobalProperties();
    }
    if (_.isEmpty(this.props.txnBlock) ) {
      this.props.getTxnBlock(this.props.gProps.head_block_number);
    }

    this.interval = setInterval(() => {
      const { TxnIDs } = this.state;
      this.props.getHeadBlocks(),
      this.setState ({
      TxnIDs: TxnIDs.concat(this.props.txnBlock.transaction_ids)}),
      this.props.getTxnBlock(this.props.gProps.head_block_number), 
      this.props.getGlobalProperties() 
        }, 1000);
    }

  componentWillUnmount() {
      clearInterval(this.interval);
}

  render() {

    const { 
      blocks, } 
    = this.props;
   
  return (
  <div className="shifted">
  <Helmet>
    <title>
      WeYouMe Network Monitor
    </title>
  </Helmet>
  <div className="feed-layout container">
    <Affix className="leftContainer" stickPosition={77}>
      <div className="left">
        <LeftSidebar />
      </div>
    </Affix>
    <div className="center">
    <div className="Network">
      <div className="Network__title">
        <h1>
          <FormattedMessage id="Network_details" defaultMessage="Network Details" />
        </h1>
      </div>
      </div>
      <div className="Network__search">
        {this.blockSearch()}
      </div>
      <div className="Network__content">
        {this.displayNetwork()}
      </div>
      <div className="Network__blocks">
      {blocks.map(block => <Block block={block.data} block_num={block.num} key={block.data.block_id} />)}
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



export default Network;
