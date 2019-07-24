const { userExists, isEmpty, normalizeUsername } = require('../validation-utils');

export const parse = (query) => {
  const cQuery = {
    id: 'message',
    json: JSON.stringify([
      'message', {
        sender: query.required_posting_auths[0],
        recipient: normalizeUsername(query.recipient),
        messageText: query.messageText,
        time: query.time,
        id: query.id,
      },
    ]),
    required_auths: [],
    required_posting_auths: query.required_posting_auths,
  };

  return cQuery;
};

export const validate = async (query, errors) => {
  if (!isEmpty(query.sender) && !await userExists(query.sender)) {
    errors.push({ field: 'sender', error: 'error_user_exist', values: { user: query.sender } });
  }

  if (!isEmpty(query.recipient) && !await userExists(query.recipient)) {
    errors.push({ field: 'recipient', error: 'error_user_exist', values: { user: query.recipient } });
  }
};
