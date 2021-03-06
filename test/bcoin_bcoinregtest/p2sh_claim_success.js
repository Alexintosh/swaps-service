const {test} = require('tap');

const {claimSuccess} = require('./../macros');

const swapType = 'p2sh';

[false, true].forEach(isPkHash => {
  // Make sure that we can swap with a pkhash
  test(`perform swap: pkhash: ${isPkHash}, ${swapType} swap address`, t => {
    return claimSuccess({
      daemon: 'bcoin',
      is_refund_to_public_key_hash: isPkHash,
      network: 'bcoinregtest',
      swap_type: swapType,
    },
    testErr => {
      if (!!testErr) {
        console.log(testErr);
        throw new Error('FailedClaimSuccess');
      }

      t.end();

      return;
    });
  });

  return;
});

