import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Block from './Block';
import Affix from '../components/Utils/Affix';
import './BlockPage.less';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Action from '../components/Button/Action';
import { Link } from 'react-router-dom';
import  _ from 'lodash';
import {
  getBlockByNumber, 
  getLoadingBlockByNumber,
} from '../reducers';
import {
  getBlock,
} from '../wallet/walletActions';

@withRouter
@connect(
  (state, ownProps) => ({
    block: getBlockByNumber(state, parseInt(ownProps.match.params.num)),
    loadingBlock: getLoadingBlockByNumber(state),
  }),
  {
    getBlock,
  },
)

class BlockPage extends React.Component {
  static propTypes = {
    match: PropTypes.shape().isRequired,
    block: PropTypes.shape().isRequired,
    getBlock: PropTypes.func.isRequired,
    };
  static defaultProps = {
    getBlock: () => {},
    };

    static fetchData({ store, match }) {
    const { num } = match.params;
    return Promise.all([
      store.dispatch(getBlock(num)),
    ]);
    };

    displayBlock() {
    const { num } = this.props.match.params;
    const nextBlock = parseInt(num) + parseInt(1);
    const prevBlock = parseInt(num) - parseInt(1);
    return(
    <div>
    <Block block={this.props.block} block_num={num} key={this.props.block.block_id} />
    <div className = "Block__buttons">
            <Link to={`/block/${nextBlock}`}> <Action primary>Next Block</Action></Link>
            <Link to={`/block/${prevBlock}`}> <Action primary>Previous Block</Action></Link>
            <Link to={`/network`}> <Action primary>Recent Blocks</Action></Link>
            </div>
    </div>
    )};


  componentDidMount() {
    const {
        match,
        block,
      } = this.props;
    const { num } = match.params;
    
    if (_.isEmpty(block) ) {
        this.props.getBlock(num);
      }
    }

  componentWillReceiveProps(nextProps) {
    const { num } = nextProps.match.params;
    const { num: prevNum } = this.props.match.params;

    const shouldUpdate = num !== prevNum;
    if (shouldUpdate) {
      this.setState( () => {
        this.props.getBlock(num);
        });
      }
    }


  render() {
    return (
        <div className="shifted">
            <Helmet>
            <title>Block Details</title>
            </Helmet>
            <div className="feed-layout container">
            <Affix className="leftContainer" stickPosition={77}>
                <div className="left">
                <LeftSidebar />
                </div>
            </Affix>
            <div className="center">
            <div className="BlockExplorer">
                <div className="BlockExplorer__title">
                <h1>
                    <FormattedMessage id="Block list" defaultMessage="Block" />
                </h1>
                </div>
                </div>
                <div className="BlockExplorer__content">
                    {this.displayBlock()}
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
  };
};

export default BlockPage;
