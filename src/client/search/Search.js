import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import DiscoverUser from '../discover/DiscoverUser';
import { Menu, Input, AutoComplete, Button } from 'antd';
import _ from 'lodash';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { 
  getUserSearchResults, 
  getSearchLoading, 
  getIsFetchingNetworkUserList, 
  getAutoCompleteSearchResults, 
  gettotalSCORE,
  getSCOREbackingTMEfundBalance, } from '../reducers';
import { userSearchBlockchain, postSearchBlockchain, searchAutoComplete } from './searchActions';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import SearchResultEmptyMessage from './SearchResultEmptyMessage';
import {
  getGlobalProperties,
} from '../wallet/walletActions';
import Affix from '../components/Utils/Affix';
import Loading from '../components/Icon/Loading';
import SearchResultPostPreview from './SearchResultPostPreview';
import SearchResultUserPreview from './SearchResultUserPreview';
import { Link } from 'react-router-dom';
import './Search.less';

@injectIntl
@connect(
  state => ({
    userSearchResults: getUserSearchResults(state),
    searchLoading: getSearchLoading(state),
    isFetchingNetworkUserList: getIsFetchingNetworkUserList(state),
    autoCompleteSearchResults: getAutoCompleteSearchResults(state),
    totalSCORE: gettotalSCORE(state),
    SCOREbackingTMEfundBalance: getSCOREbackingTMEfundBalance(state),
  }),
  {
    userSearchBlockchain,
    postSearchBlockchain,
    searchAutoComplete,
    getGlobalProperties,
  },
)
class Search extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    userSearchResults: PropTypes.arrayOf(PropTypes.shape()),
    searchLoading: PropTypes.bool.isRequired,
    userSearchBlockchain: PropTypes.func.isRequired,
    postSearchBlockchain: PropTypes.func.isRequired,
    searchAutoComplete: PropTypes.func.isRequired,
    totalSCORE: PropTypes.string.isRequired,
    SCOREbackingTMEfundBalance: PropTypes.string.isRequired,
  };

  static defaultProps = {
    userSearchResults: [],
    autoCompleteSearchResults: [],
  };

  static fetchData({ store}) {
    return Promise.all([
        store.dispatch(getAllAccounts()),
        store.dispatch(getGlobalProperties()),
    ]);   
  }
  
  constructor(props) {
    super(props);

    this.state = {
      searchBarActive: false,
      popoverVisible: false,
      searchPageBarValue: '',
    };
    
    this.handleSelectOnAutoCompleteDropdown = this.handleSelectOnAutoCompleteDropdown.bind(this);
    this.handleAutoCompleteSearch = this.handleAutoCompleteSearch.bind(this);
    this.handleSearchForInput = this.handleSearchForInput.bind(this);
    this.handleOnChangeForAutoComplete = this.handleOnChangeForAutoComplete.bind(this);
    this.hideAutoCompleteDropdown = this.hideAutoCompleteDropdown.bind(this);
  }

  componentDidMount() {
    const {allAccounts, SCOREbackingTMEfundBalance, totalSCORE } = this.props;

    if (_.isEmpty(SCOREbackingTMEfundBalance) || _.isEmpty(totalSCORE)) {
        this.props.getGlobalProperties();
      }
    const searchQuery = _.get(this.props.location.state, 'query', '');
    if (!_.isEmpty(searchQuery)) {
      this.props.userSearchBlockchain(searchQuery, 10);
    } else {
      const searchQueryRegexResults = this.props.location.search.match(/\?q=(.*)/);
      const searchQueryFromUrl = _.get(searchQueryRegexResults, 1, '');
      this.props.userSearchBlockchain(searchQueryFromUrl, 10);
    }
  }

  componentWillReceiveProps(nextProps) {

    const oldSearchQuery = _.get(this.props.location.state, 'query', '');
    const newSearchQuery = _.get(nextProps.location.state, 'query', '');

    if (oldSearchQuery !== newSearchQuery) {
      this.props.userSearchBlockchain(newSearchQuery, 10);
    }
  }

  renderSearchResult() {

    const { totalSCORE, SCOREbackingTMEfundBalance} = this.props;
    
    return _.map(this.props.userSearchResults, (result, i) => {
      switch (result.type) {
        case 'post':
          return (
            <SearchResultPostPreview
              key={`${i}/${result.author}/${result.permlink}`}
              author={result.author}
              created={result.created}
              title={result.title}
              summary={result.summary}
              permlink={result.permlink}
              tags={result.tags}
            />
          );
        case 'user':
          return <DiscoverUser 
            user={result}  
            totalSCORE={totalSCORE} 
            SCOREbackingTMEfundBalance={SCOREbackingTMEfundBalance}
            key={'search'+result.id} />;
        default:
          return null;
      }
    });
  }

  hideAutoCompleteDropdown() {
    this.props.searchAutoComplete('');
  }

  handleSearchForInput(event) {
		let query = event.target.value;
    const value = event.target.value;
    this.hideAutoCompleteDropdown();
    this.props.history.push({
      pathname: '/search',
      search: `q=${value}`,
      state: {
        query: query,
      },
    });
  }

  debouncedSearch = _.debounce(value => this.props.searchAutoComplete(value), 300);

  handleAutoCompleteSearch(value) {
    this.debouncedSearch(value);
  }

  handleSelectOnAutoCompleteDropdown(value) {
		this.props.history.push(`/@${value}`);
		this.setState({
      searchPageBarValue: '',
    });
  }

  handleOnChangeForAutoComplete(value) {
		const { searchPageBarValue } = this.state;
			this.setState({
				searchPageBarValue: value,
			});
  }

  render() {
    const { 
      intl, 
      autoCompleteSearchResults, 
      userSearchResults, 
      searchLoading, 
      totalSCORE, 
      SCOREbackingTMEfundBalance } = this.props;

    const { searchBarActive, searchPageBarValue } = this.state;
    const noSearchResults = _.isEmpty(userSearchResults) && !searchLoading;
    let searchQuery = '';
    
    searchQuery = _.get(this.props.location.state, 'query', '');
    
    if (_.isEmpty(searchQuery)) {
      const searchQueryRegexResults = this.props.location.search.match(/\?q=(.*)/);
      searchQuery = _.get(searchQueryRegexResults, 1, '');
    }
    
    const dropdownOptions = autoCompleteSearchResults.map((option, i) => (
      <AutoComplete.Option key={`searchPageAccount-${i}`} value={option} className="Topnav__search-autocomplete">
        {`User: ${option}`}
      </AutoComplete.Option>
    ));
    const formattedAutoCompleteDropdown = _.isEmpty(searchPageBarValue)
      ? []
      : dropdownOptions.concat([

        <AutoComplete.Option disabled key="searchPageTag" className="Topnav__search-tag">
          <Link to={`/trending-${searchPageBarValue}/hot-${searchPageBarValue}`} key="searchPageTag-link">
            <span onClick={this.hideAutoCompleteDropdown} role="presentation">
                {intl.formatMessage(
                  {
                    id: 'search_tag_results',
                    defaultMessage: 'Tag: {search}',
                  },
                  { search: searchPageBarValue },
                )}
            </span>
          </Link>
        </AutoComplete.Option>,
        <AutoComplete.Option disabled key="searchPage-all" className="Topnav__search-all-results">
            <Link
              to={{
                pathname: '/search',
                search: `?q=${searchPageBarValue}`,
                state: { query: searchPageBarValue },
              }}
            >
              <span onClick={this.hideAutoCompleteDropdown} role="presentation">
                {intl.formatMessage(
                  {
                    id: 'search_all_results_for',
                    defaultMessage: 'Search all results for {search}',
                  },
                  { search: searchPageBarValue },
                )}
              </span>
            </Link>
          </AutoComplete.Option>
        ]);

    return (
      <div className="settings-layout container">
        <Helmet>
          <title>{intl.formatMessage({ id: 'search', defaultMessage: 'Search' })} - WeYouMe</title>
        </Helmet>
        <Affix className="leftContainer" stickPosition={77}>
          <div className="left">
            <LeftSidebar />
          </div>
        </Affix>
        <div className="center">
          <h1 className="Search__title">
            <FormattedMessage id="search_results" defaultMessage="Search" />
          </h1>
          <div className="Search__input-container">
              <AutoComplete
                dropdownClassName="Search__search-dropdown-container"
                dataSource={formattedAutoCompleteDropdown}
                onSearch={this.handleAutoCompleteSearch}
                onSelect={this.handleSelectOnAutoCompleteDropdown}
                onChange={this.handleOnChangeForAutoComplete}
                defaultActiveFirstOption={false}
                dropdownMatchSelectWidth={false}
                optionLabelProp="value"
                value={searchPageBarValue}
              >
                <Input
                  ref={ref => {
                    this.searchInputRef = ref;
                  }}
                  onPressEnter={this.handleSearchForInput}
                  placeholder={intl.formatMessage({
                    id: 'search_placeholder',
                    defaultMessage: 'Search:',
                  })}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </AutoComplete>
            <i className="iconfont icon-search" />
          </div>
          <div className="Search">
            <div className="Search__taglink"> 
              <Button>
                <Link to={`/trending-${searchQuery || "all"}/hot-${searchQuery || "all"}`}>
                  <FormattedMessage id="search_tag" defaultMessage={intl.formatMessage(
                    {
                      id: 'search_tag_link',
                      defaultMessage: 'Browse Tag: {search}',
                    },
                    { search: searchQuery || "All" },
                  )}/>
                </Link>
              </Button>
              <Button>
                <Link to={`/discover/`}>
                  <FormattedMessage id="search_tag" defaultMessage={intl.formatMessage(
                    {
                      id: 'discover_link',
                      defaultMessage: 'Top accounts',
                    }
                  )}/>
                </Link>
              </Button>
              <Button>
                <Link to={`/boards`}>
                  <FormattedMessage id="search_tag" defaultMessage={intl.formatMessage(
                    {
                      id: 'boards_link',
                      defaultMessage: 'Select Boards',
                    }
                  )}/>
                </Link>
              </Button>
            </div>
            <div className="Search__results-container" >
              {noSearchResults && <SearchResultEmptyMessage />}
              {searchLoading ? <Loading style={{ marginTop: '20px' }} /> : this.renderSearchResult()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
