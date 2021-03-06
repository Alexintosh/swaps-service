const asyncAuto = require('async/auto');

const chainRpc = require('./call_chain_rpc');
const {getBlockHeader} = require('./conf/rpc_commands');
const {returnResult} = require('./../async-util');

const msPerSec = 1e3;
const notFoundIndex = -1;

/** Get block header details for a given block

  {
    block: <Block Hash Id String>
    network: <Network Name String>
    [priority]: <Priority Number>
  }

  @returns via cbk
  {
    [current_confirmation_count]: <Current Confirmation Count Number>
    [height]: <Chain Height Number>
    [median_created_at]: <Median Time Created At ISO 8601 String>
    [previous_block]: <Previous Block Hash Hex String>
  }
*/
module.exports = ({block, cache, network, priority}, cbk) => {
  return asyncAuto({
    // Check arguments
    validate: cbk => {
      if (!block) {
        return cbk([400, 'ExpectedBlockId'])
      }

      if (!network) {
        return cbk([400, 'ExpectedNetworkName']);
      }

      return cbk();
    },

    // Pull the fresh block header details
    getHeader: ['validate', ({}, cbk) => {
      return chainRpc({
        network,
        priority,
        cmd: getBlockHeader,
        params: [block],
      },
      (err, details) => {
        if (!!err) {
          return cbk(err);
        }

        // Exit early with no details when the block details are absent
        if (!details) {
          return cbk(null, {});
        }

        const {confirmations} = details;
        const {height} = details;
        const {mediantime} = details;

        if (!confirmations || confirmations < notFoundIndex) {
          return cbk([503, 'UnexpectedConfirmationsValue']);
        }

        if (height === undefined) {
          return cbk([503, 'ExpectedBlockHeight']);
        }

        if (!mediantime) {
          return cbk([503, 'ExpectedBlockMedianTimeValue']);
        }

        return cbk(null, {
          height,
          current_confirmation_count: confirmations > 0 ? confirmations : null,
          median_created_at: new Date(mediantime * msPerSec).toISOString(),
          previous_block: details.previousblockhash,
        });
      });
    }],
  },
  returnResult({of: 'getHeader'}, cbk));
};

