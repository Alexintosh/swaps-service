const {ECPair} = require('./../tokenslib');
const {networks} = require('./../tokenslib');
const {Transaction} = require('./../tokenslib');

const {fromHex} = Transaction;
const {fromWIF} = ECPair;
const {SIGHASH_ALL} = Transaction;

/** Generate signed witnesses for a SegWit claim transaction

  {
    key: <Signing Key WIF String>
    network: <Network Name String>
    preimage: <HTLC Preimage Hex String>
    transaction: <Unsigned Transaction Hex String>
    utxos: [{
      redeem: <Redeem Script Hex String>
      script: <Spending Outpoint Output Script Hex String>
      tokens: <Spending Outpoint Tokens Value Number>
      vin: <Input Index Number>
    }]
  }

  @throws Error on invalid arguments

  @returns
  [{
    vin: <Input Index Number>
    witness: [<Witness Stack Hex String>]
  }]
*/
module.exports = ({key, network, preimage, transaction, utxos}) => {
  if (!transaction) {
    throw new Error('ExpectedTransactionForWitnessGeneration');
  }

  if (!Array.isArray(utxos)) {
    throw new Error('ExpectedWitnessUtxosForClaimWitnesses');
  }

  const signingKey = fromWIF(key, networks[network]);
  const tx = fromHex(transaction);

  return utxos.map(({redeem, tokens, vin}) => {
    const script = Buffer.from(redeem, 'hex');

    const sigHash = tx.hashForWitnessV0(vin, script, tokens, SIGHASH_ALL);

    const signature = signingKey.sign(sigHash).toScriptSignature(SIGHASH_ALL);

    return {
      vin,
      witness: [signature.toString('hex'), preimage, redeem],
    };
  });
};

