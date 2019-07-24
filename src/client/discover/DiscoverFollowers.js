import React from 'react';
import PropTypes from 'prop-types';
import DiscoverUser from './DiscoverUser';
import ReduxInfiniteScroll from '../vendor/ReduxInfiniteScroll';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    getIsFetchingAllAccountsList,
    gettotalSCORE,
    getSCOREbackingTMEfundBalance,
    getAllAccountsList,
  } from '../reducers';
  import {
    getGlobalProperties,
  } from '../wallet/walletActions';
import { getAllAccounts } from '../user/userActions';
import Loading from '../components/Icon/Loading';

const displayLimit = 20;

@connect(
    (state) => ({
      isFetchingAllAccountsList: getIsFetchingAllAccountsList(state),
      allAccounts: getAllAccountsList(state),
      totalSCORE: gettotalSCORE(state),
      SCOREbackingTMEfundBalance: getSCOREbackingTMEfundBalance(state),
    }),
    {
      getGlobalProperties,
      getAllAccounts,
    },
  )

class DiscoverFollowers extends React.Component {
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

  static fetchData({ store, match }) {
    return Promise.all([
        store.dispatch(getGlobalProperties()),
        store.dispatch(getAllAccounts()),
    ]);   
  }

  componentDidMount() {
    const {allAccounts, SCOREbackingTMEfundBalance, totalSCORE } = this.props;

    if (_.isEmpty(SCOREbackingTMEfundBalance) || _.isEmpty(totalSCORE)) {
        this.props.getGlobalProperties();
      }

    if (_.isEmpty(allAccounts)) {
        this.props.getAllAccounts();
      }

    const initialUsers = allAccounts.sort((a,b) => b.follower_count-a.follower_count).slice(0, displayLimit);
    this.setState({
        users: initialUsers,
      });
  };

  handleLoadMore = () => {
    const { users } = this.state;
    const { allAccounts } = this.props;
    const moreUsersStartIndex = users.length;
    const moreUsers = allAccounts.sort((a,b) => b.follower_count-a.follower_count).slice(moreUsersStartIndex, moreUsersStartIndex + displayLimit);
    this.setState({
        users: users.concat(moreUsers),
    });
  };

  render() {
    const { users } = this.state;
    const { allAccounts, totalSCORE, SCOREbackingTMEfundBalance, isFetchingAllAccountsList} = this.props;
    const hasMore = users.length !== allAccounts.length;
   
    return (
      <div>
        {isFetchingAllAccountsList && <Loading />}
        {isFetchingAllAccountsList && <div> Loading all network users... </div>}
        {!isFetchingAllAccountsList && <ReduxInfiniteScroll hasMore={hasMore} loadMore={this.handleLoadMore}>
          {users.map(user => 
          <DiscoverUser 
            user={user}  
            totalSCORE={totalSCORE} 
            SCOREbackingTMEfundBalance={SCOREbackingTMEfundBalance}
            key={'discover'+user.id} />)}
        </ReduxInfiniteScroll> }
      </div>
    );
  }
}

export default DiscoverFollowers
