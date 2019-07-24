import React from 'react';
import PropTypes from 'prop-types';
import changeCase from 'change-case';

const SignPlaceholderNonFilterer = ({
  query,
}) =>
  <div className="Placeholder__operation-content">
    <ul className="Placeholder__operation-params">
      {Object.keys(query).map(key =>
        query[key] &&
        <li key={key}>
          <strong>{changeCase.titleCase(key)}</strong>
          <span>{query[key]}</span>
        </li>
      )}
    </ul>
  </div>
;

SignPlaceholderNonFilterer.propTypes = {
  query: PropTypes.shape(),
};

export default SignPlaceholderNonFilterer;
