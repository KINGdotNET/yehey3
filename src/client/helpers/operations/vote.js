const cloneDeep = require('lodash/cloneDeep');
const { contentExists } = require('../validation-utils');

export const optionalFields = ['weight'];

export const parse = (query) => {
  const cQuery = cloneDeep(query);
  cQuery.weight = cQuery.weight ? parseInt(cQuery.weight, 10) : 10000;
  return cQuery;
};

export const validate = async (query, errors) => {
  if (errors.length === 0 && !await contentExists(query.author, query.permlink)) {
    errors.push({ field: 'permlink', error: 'error_post_exist' });
  }
};