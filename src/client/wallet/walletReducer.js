import _ from 'lodash';
import * as walletActions from './walletActions';
import { actionsFilter, ACTIONS_DISPLAY_LIMIT } from '../helpers/accountHistoryHelper';
import { getUserDetailsKey } from '../helpers/stateHelpers';

const initialState = {
  transferVisible: false,
  transferTo: '',
  transferAmount: 0,
  transferMemo: '',
  transferCurrency: '',
  transferType: '',
  transferCallBack: '',
  powerUpOrDownVisible: false,
  powerDown: false,
  totalSCORE: '',
  SCOREbackingTMEfundBalance: '',
  headBlockID: '',
  headBlockNumber: 0,
  pendingRewards: '',
  block: {
    block_id: "Loading block id",
    extensions: [],
    previous: "Loadind previous block id",
    signing_key: "Loading signing key",
    timestamp: "Loading Time",
    transaction_ids: [],
    transaction_merkle_root: "Loading Merkle Root",
    transactions: [],
    witness: "Loading Witness",
    witness_signature: "Loading Signature",
  },
  txnBlock: {
    block_id: "Loading block id",
    extensions: [],
    previous: "Loadind previous block id",
    signing_key: "Loading signing key",
    timestamp: "Loading Time",
    transaction_ids: [],
    transaction_merkle_root: "Loading Merkle Root",
    transactions: [],
    witness: "Loading Witness",
    witness_signature: "Loading Signature",
  },
  blocks: [],
  gProps: {
    TSD_interest_rate: 1000,
    TSD_print_rate: 0,
    average_block_size: 121,
    confidential_TSD_supply: "0.000 TSD",
    confidential_supply: "0.000 TME",
    current_TSD_supply: "Loading TSD",
    current_aslot: 4079735,
    current_reserve_ratio: 200000000,
    current_supply: "Loading TME",
    current_witness: "Loading",
    head_block_id: "Loading",
    head_block_number: 1,
    id: 0,
    last_irreversible_block_num: 1,
    max_virtual_bandwidth: "1585446912000000000000",
    maximum_block_size: 131072,
    num_pow_witnesses: 0,
    participation_count: 128,
    pending_rewarded_SCORE: "Loading SCORE",
    pending_rewarded_SCOREvalueInTME: "Loading TME",
    recent_slots_filled: "340282366920938463463374607431768211455",
    time: "Loading Time",
    totalSCORE: "Loading SCORE",
    totalSCOREreward2: "0",
    totalTMEfundForSCORE: "Loading TME",
    total_pow: "18446744073709551615",
    total_reward_fund_TME: "Loading TME",
    virtual_supply: "Loading TME",
    vote_power_reserve_rate: 10,
    },
  transaction: {},
  loadingTransaction: true,
  loadingBlock: false,
  loadingTxnBlock: false,
  usersTransactions: {},
  usersAccountHistory: {},
  usersEstAccountsValues: {},
  usersAccountHistoryLoading: true,
  loadingEstAccountValue: true,
  loadingGlobalProperties: true,
  loadingHeadBlocks: true,
  loadingMoreUsersAccountHistory: false,
  accountHistoryFilter: [],
  currentDisplayedActions: [],
  currentFilteredActions: [],
};

export default function walletReducer(state = initialState, action) {
  switch (action.type) {
    case walletActions.OPEN_TRANSFER:
      return {
        ...state,
        transferVisible: true,
        transferTo: action.payload.to,
        transferAmount: action.payload.amount,
        transferMemo: action.payload.memo,
        transferCurrency: action.payload.currency,
        transferType: action.payload.type,
        transferCallBack: action.payload.callBack,
      };
    case walletActions.CLOSE_TRANSFER:
      return {
        ...state,
        transferVisible: false,
      };
    case walletActions.OPEN_POWER_UP_OR_DOWN:
      return {
        ...state,
        powerUpOrDownVisible: true,
        powerDown: !!action.payload,
      };
    case walletActions.CLOSE_POWER_UP_OR_DOWN:
      return {
        ...state,
        powerUpOrDownVisible: false,
      };
    case walletActions.GET_GLOBAL_PROPERTIES.START:
      return {
        ...state,
        loadingGlobalProperties: true,
      };
    case walletActions.GET_GLOBAL_PROPERTIES.SUCCESS: {
      return {
        ...state,
        gProps: action.payload,
        SCOREbackingTMEfundBalance: action.payload.totalTMEfundForSCORE,
        totalSCORE: action.payload.totalSCORE,
        headBlockID: action.payload.head_block_id,
        headBlockNumber: action.payload.head_block_number,
        pendingRewards: action.payload.pending_rewarded_SCOREvalueInTME,
        loadingGlobalProperties: false,
      };
    }
    case walletActions.GET_TRANSACTION.START: {
      return {
        ...state,
        loadingTransaction: true,
      };
    }
    case walletActions.GET_TRANSACTION.SUCCESS: {
      return {
        ...state,
        transaction: action.payload,
        loadingTransaction: false,
      };
    }
    case walletActions.GET_TRANSACTION.ERROR: {
      return {
        ...state,
        loadingTransaction: false,
      };
    }
    case walletActions.GET_BLOCK.START: {
      return {
        ...state,
        loadingBlock: true,
      };
    }
    case walletActions.GET_BLOCK.SUCCESS: {
      return {
        ...state,
        block: action.payload,
        loadingBlock: false,
      };
    }
    case walletActions.GET_BLOCK.ERROR: {
      return {
        ...state,
        loadingBlock: false,
      };
    }
    case walletActions.GET_TXN_BLOCK.START: {
      return {
        ...state,
        loadingTxnBlock: true,
      };
    }
    case walletActions.GET_TXN_BLOCK.SUCCESS: {
      return {
        ...state,
        txnBlock: action.payload,
        loadingTxnBlock: false,
      };
    }
    case walletActions.GET_TXN_BLOCK.ERROR: {
      return {
        ...state,
        loadingTxnBlock: false,
      };
    }
    case walletActions.GET_HEAD_BLOCKS.START: {
      return {
        ...state,
        loadingHeadBlocks: true,
      };
    }
    case walletActions.GET_HEAD_BLOCKS.SUCCESS: {
      return {
        ...state,
        blocks: action.payload,
        loadingHeadBlocks: false,
      };
    }
    case walletActions.GET_HEAD_BLOCKS.ERROR: {
      return {
        ...state,
        loadingHeadBlocks: false,
      };
    }
    case walletActions.GET_GLOBAL_PROPERTIES.ERROR: {
      return {
        ...state,
        loadingGlobalProperties: false,
      };
    }
    case walletActions.GET_USER_ACCOUNT_HISTORY.START:
      return {
        ...state,
        usersAccountHistoryLoading: true,
      };
    case walletActions.GET_USER_ACCOUNT_HISTORY.SUCCESS:
      return {
        ...state,
        usersTransactions: {
          ...state.usersTransactions,
          [getUserDetailsKey(action.payload.username)]: action.payload.userWalletTransactions,
        },
        usersAccountHistory: {
          ...state.usersAccountHistory,
          [getUserDetailsKey(action.payload.username)]: action.payload.userAccountHistory,
        },
        usersAccountHistoryLoading: false,
      };
    case walletActions.GET_USER_ACCOUNT_HISTORY.ERROR:
      return {
        ...state,
        usersAccountHistoryLoading: false,
      };
    case walletActions.GET_MORE_USER_ACCOUNT_HISTORY.START:
      return {
        ...state,
        loadingMoreUsersAccountHistory: true,
      };
    case walletActions.GET_MORE_USER_ACCOUNT_HISTORY.SUCCESS: {
      const usernameKey = getUserDetailsKey(action.payload.username);
      const userCurrentWalletTransactions = _.get(state.usersTransactions, usernameKey, []);
      const userCurrentAccountHistory = _.get(state.usersAccountHistory, usernameKey, []);

      return {
        ...state,
        usersTransactions: {
          ...state.usersTransactions,
          [usernameKey]: _.uniqBy(
            userCurrentWalletTransactions.concat(action.payload.userWalletTransactions),
            'actionCount',
          ),
        },
        usersAccountHistory: {
          ...state.usersAccountHistory,
          [usernameKey]: _.uniqBy(
            userCurrentAccountHistory.concat(action.payload.userAccountHistory),
            'actionCount',
          ),
        },
        loadingMoreUsersAccountHistory: false,
      };
    }
    case walletActions.GET_MORE_USER_ACCOUNT_HISTORY.ERROR:
      return {
        ...state,
        loadingMoreUsersAccountHistory: false,
      };
    case walletActions.GET_USER_EST_ACCOUNT_VALUE.START:
      return {
        ...state,
        loadingEstAccountValue: true,
      };
    case walletActions.GET_USER_EST_ACCOUNT_VALUE.SUCCESS:
      return {
        ...state,
        usersEstAccountsValues: {
          ...state.usersEstAccountsValues,
          [getUserDetailsKey(action.payload.username)]: action.payload.value,
        },
        loadingEstAccountValue: false,
      };
    case walletActions.GET_USER_EST_ACCOUNT_VALUE.ERROR:
      return {
        ...state,
        loadingEstAccountValue: false,
      };
    case walletActions.UPDATE_ACCOUNT_HISTORY_FILTER: {
      const usernameKey = getUserDetailsKey(action.payload.username);
      const currentUserActions = state.usersAccountHistory[usernameKey];
      const initialActions = _.slice(currentUserActions, 0, ACTIONS_DISPLAY_LIMIT);
      const initialFilteredActions = _.filter(initialActions, userAction =>
        actionsFilter(userAction, action.payload.accountHistoryFilter, action.payload.username),
      );
      return {
        ...state,
        accountHistoryFilter: action.payload.accountHistoryFilter,
        currentDisplayedActions: initialActions,
        currentFilteredActions: initialFilteredActions,
      };
    }
    case walletActions.SET_INITIAL_CURRENT_DISPLAYED_ACTIONS: {
      const currentUserActions = state.usersAccountHistory[getUserDetailsKey(action.payload)];
      return {
        ...state,
        currentDisplayedActions: _.slice(currentUserActions, 0, ACTIONS_DISPLAY_LIMIT),
      };
    }
    case walletActions.ADD_MORE_ACTIONS_TO_CURRENT_DISPLAYED_ACTIONS:
      return {
        ...state,
        currentDisplayedActions: _.concat(
          state.currentDisplayedActions,
          action.payload.moreActions,
        ),
        currentFilteredActions: _.concat(
          state.currentFilteredActions,
          action.payload.filteredMoreActions,
        ),
        loadingMoreUsersAccountHistory: false,
      };
    case walletActions.UPDATE_FILTERED_ACTIONS:
      return {
        ...state,
        currentFilteredActions: action.payload,
      };
    case walletActions.LOADING_MORE_USERS_ACCOUNT_HISTORY:
      return {
        ...state,
        loadingMoreUsersAccountHistory: true,
      };
    default:
      return state;
  }
}

export const getIsTransferVisible = state => state.transferVisible;
export const getTransferTo = state => state.transferTo;
export const getTransferAmount = state => state.transferAmount;
export const getTransferMemo = state => state.transferMemo;
export const getTransferCurrency = state => state.transferCurrency;
export const getTransferType = state => state.transferType;
export const getTransferCallBack = state => state.transferCallBack;

export const getIsPowerUpOrDownVisible = state => state.powerUpOrDownVisible;
export const getIsPowerDown = state => state.powerDown;
export const getGlobalProperties = state => state.gProps;
export const gettotalSCORE = state => state.totalSCORE;
export const getTransaction = state => state.transaction;
export const getLoadingTransaction = state => state.loadingTransaction;
export const getBlock = state => state.block;
export const getLoadingBlock = state => state.loadingBlock;
export const getTxnBlock = state => state.txnBlock;
export const getLoadingTxnBlock = state => state.loadingTxnBlock;
export const getHeadBlocks = state => state.blocks;
export const getLoadingHeadBlocks = state => state.loadingHeadBlocks;
export const getHeadBlockID = state => state.headBlockID;
export const getHeadBlockNumber = state => state.headBlockNumber;
export const getPendingRewards = state => state.pendingRewards;
export const getSCOREbackingTMEfundBalance = state => state.SCOREbackingTMEfundBalance;
export const getUsersTransactions = state => state.usersTransactions;
export const getUsersEstAccountsValues = state => state.usersEstAccountsValues;
export const getUsersAccountHistoryLoading = state => state.usersAccountHistoryLoading;
export const getLoadingEstAccountValue = state => state.loadingEstAccountValue;
export const getLoadingGlobalProperties = state => state.loadingGlobalProperties;
export const getUsersAccountHistory = state => state.usersAccountHistory;
export const getLoadingMoreUsersAccountHistory = state => state.loadingMoreUsersAccountHistory;
export const getUserHasMoreAccountHistory = (state, username) => {
  const lastAction = _.last(state.usersAccountHistory[getUserDetailsKey(username)]) || {};
  return lastAction.actionCount !== 1 && lastAction.actionCount !== 0 && lastAction.actionCount !== undefined;
};
export const getAccountHistoryFilter = state => state.accountHistoryFilter;
export const getCurrentDisplayedActions = state => state.currentDisplayedActions;
export const getCurrentFilteredActions = state => state.currentFilteredActions;
