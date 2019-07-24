import * as profileUpdate from './profile-update';
import * as comment from './comment';
import * as customJson from './custom-json';
import * as delegateSCORE from './delegate-SCORE';
import * as escrowApprove from './escrow-approve';
import * as escrowDispute from './escrow-dispute';
import * as escrowRelease from './escrow-release';
import * as escrowTransfer from './escrow-transfer';
import * as follow from './follow';
import * as mute from './mute';
import * as reblog from './reblog';
import * as message from './message';
import * as changeRecoveryAccount from './change-recovery-account';
import * as setWithdrawSCOREasTMEroute from './set-withdraw-SCORE-route';
import * as transfer from './transfer';
import * as undelegateSCORE from './undelegate-SCORE';
import * as unfollow from './unfollow';
import * as unmute from './unmute';
import * as vote from './vote';
import * as convert from './convert';

export default {
  comment,
  customJson,
  delegateSCORE,
  escrow_approve: escrowApprove,
  escrow_dispute: escrowDispute,
  escrow_release: escrowRelease,
  escrow_transfer: escrowTransfer,
  follow,
  mute,
  reblog,
  message,
  change_recovery_account: changeRecoveryAccount,
  setWithdrawSCOREasTMEroute: setWithdrawSCOREasTMEroute,
  transfer,
  undelegateSCORE: undelegateSCORE,
  unfollow,
  unmute,
  profile_update: profileUpdate,
  vote,
  convert,
};
