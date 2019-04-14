import React from 'react';
import { people } from '../helpers/constants';
import DiscoverUser from './DiscoverUser';
import BlockchainAPI from '../blockchainAPI';
import ReduxInfiniteScroll from '../vendor/ReduxInfiniteScroll';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    gettotalSCORE,
    getSCOREbackingTMEfundBalance,
    getIsFetchingAllAccountsList,
    getAllAccountsList,
  } from '../reducers';
  import {
    getGlobalProperties,
  } from '../wallet/walletActions';
import { getAllAccounts } from '../user/userActions';
import Loading from '../components/Icon/Loading';
import { getAccountWithFollowingCount } from '../helpers/apiHelpers';



@connect(
  (state) => ({
    isFetchingAllAccountsList: getIsFetchingAllAccountsList(state),
    allAccounts: getAllAccountsList(state),
    totalSCORE: gettotalSCORE(state),
    SCOREbackingTMEfundBalance: getSCOREbackingTMEfundBalance(state),
  }),
  {
    getAllAccounts,
    getGlobalProperties,
  },
)

class DiscoverRecommended extends React.Component {
  static propTypes = {
    getAllAccounts: PropTypes.func.isRequired,
    allAccounts: PropTypes.array.isRequired,
    isFetchingAllAccountsList: PropTypes.bool.isRequired,
    totalSCORE: PropTypes.string.isRequired,
    SCOREbackingTMEfundBalance: PropTypes.string.isRequired,
};

static defaultProps = {
    allAccounts: [],
    getAllAccounts: () => {},
  };

  state = {
    users: [],
  };

  static fetchData({ store}) {
    return Promise.all([
        store.dispatch(getAllAccounts()),
        store.dispatch(getGlobalProperties()),
    ]);   
  }

  componentDidMount() {
    const { users } = this.state;
    const { SCOREbackingTMEfundBalance, totalSCORE } = this.props;
    const index = users.length;

    if (_.isEmpty(SCOREbackingTMEfundBalance) || _.isEmpty(totalSCORE)) {
        this.props.getGlobalProperties();
      }

    const initialUser = people[index];
    //console.log("Initial Users: ", initialUser);
    getAccountWithFollowingCount(initialUser).then(users =>
      this.setState({
        users: [users],
      }),
    ).catch(err=>{console.error('err', err)});
  }

  handleLoadMore = () => {
    const { users } = this.state;
    const index = users.length;
    const nextUser = people[index];
    getAccountWithFollowingCount(nextUser).then(moreUsersResponse =>
      this.setState({
        users: users.concat(moreUsersResponse),
      }),
    ).catch(err=>{console.error('err', err)});
  };

  render() {
    const { users } = this.state;
    const { SCOREbackingTMEfundBalance, totalSCORE } = this.props;
    const hasMore = users.length !== people.length;
    return (
      <div>
       {!!users.length && <ReduxInfiniteScroll hasMore={hasMore} loadMore={this.handleLoadMore}>
          {users.map(user => 
          <DiscoverUser 
            user={user} 
            key={'discover'+user.id} 
            totalSCORE={totalSCORE} 
            SCOREbackingTMEfundBalance={SCOREbackingTMEfundBalance}  
            />)}
        </ReduxInfiniteScroll>}
      </div>
    );
  }
}

export default DiscoverRecommended;
