export default [
  {
    "operation": 'follow',
    "type": 'customJson',
    "params": ['follower', 'following', 'what'],
  },
  {
    "operation": 'unfollow',
    "type": 'customJson',
    "params": ['follower', 'following', 'what'],
  },
  {
    "operation": 'reblog',
    "type": 'customJson',
    "params": ['author', 'permlink'],
  },
  {
    "operation": 'mute',
    "type": 'customJson',
    "params": ['follower', 'following', 'what'],
  },
  {
    "operation": 'unmute',
    "type": 'customJson',
    "params": ['follower', 'following'],
  },
  {
    "operation": 'message',
    "type": 'customJson',
    "params": ['sender', 'recipient', 'messageText', 'id', 'time'],
  },
  {
    "operation": 'undelegateSCORE',
    "type": 'delegateSCORE',
    "params": ['delegator', 'delegatee'],
  },
  {
    "operation": 'profile_update',
    "type": 'accountUpdate',
    "params": ['account'],
  },
];
