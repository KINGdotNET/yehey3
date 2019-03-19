import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link } from 'react-router-dom';

const Block = ({ block, block_num }) => {
  
  Block.propTypes = {
    block: PropTypes.shape().isRequired,
  };
  
  const blockID = block.block_id;
  const blockNumber = block_num;
  const TransactionIDs = block.transaction_ids;
  const Witness = block.witness;
  const Timestamp = block.timestamp;
  const showTxns = !(_.isEmpty(block.transaction_ids))


  return (
    <div key={block.block_id} className="Block">
      <div className="Block__content">
        <h3 className="Block__number">
        Block Number: <Link to={`/block/${blockNumber}`}> {blockNumber}</Link>
        </h3>
        <h4 className="Block__id">
            Block Id: {blockID}
        </h4>
        <h4 className="Block__timestamp">
            Block Time: {Timestamp}
        </h4>
        <h4 className="Block__witness">
            Witness: {Witness}
        </h4>
        <h4 className="Block__transactionIDs">
            Transaction IDs: {showTxns && TransactionIDs.map(txn => <Link to={`/tx/${txn}`} key={txn}> {txn} </Link>)}
        </h4>
      </div>
    </div>
  );
};

export default Block;
