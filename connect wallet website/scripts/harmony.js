var hmy;
//var address = userWallet.innerText;

// import that correctly handles Ethereum addresses 
const createKeccakHash = require('keccak') 

// parsing address
function toChecksumAddress (address) {
  address = address.toLowerCase().replace('0x', '')
  var hash = createKeccakHash('keccak256').update(address).digest('hex')
  var ret = '0x'

  for (var i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}
 
// import harmony libraries from SDK
function initializeHarmony(){
  const { Harmony } = require('@harmony-js/core');
  const {
    ChainID,
    ChainType,
    hexToNumber,
    numberToHex,
    fromWei,
    Units,
    Unit,
  } = require('@harmony-js/utils');

  hmy = new Harmony(
    'https://api.s0.b.hmny.io/',
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyTestnet,
    },
  ); 
  
  // process to do transaction
  const txn = hmy.transactions.newTx({
    to: toChecksumAddress(address),
    value: new Unit(1).asOne().toWei(),
    // gas limit, you can use string
    gasLimit: '21000',
    // send token from shardID
    shardID: 0,
    // send token to toShardID
    toShardID: 0,
    // gas Price, you can use Unit class, and use Gwei, then remember to use toWei(), which will be transformed to BN
    gasPrice: new hmy.utils.Unit('1').asGwei().toWei(),
  });

  // need private key of a "main" wallet, where ONE tokens will come from
  async function transfer() {
    hmy.wallet.addByPrivateKey(walletprivatekey);
    
    // printing transaction details
    const signedTxn = await hmy.wallet.signTransaction(txn);
    signedTxn
      .observed()
      .on('transactionHash', (txnHash) => {
        console.log('');
        console.log('--- hash ---');
        console.log('');
        console.log(txnHash);
        console.log('');
      })
      .on('receipt', (receipt) => {
        console.log('');
        console.log('--- receipt ---');
        console.log('');
        console.log(receipt);
        console.log('');
      })
      .on('cxReceipt', (receipt) => {
        console.log('');
        console.log('--- cxReceipt ---');
        console.log('');
        console.log(receipt);
        console.log('');
      })
      .on('error', (error) => {
        console.log('');
        console.log('--- error ---');
        console.log('');
        console.log(error);
        console.log('');
      });
      
    const [sentTxn, txnHash] = await signedTxn.sendTransaction();
    
    const confiremdTxn = await sentTxn.confirm(txnHash);
  
    // if the transaction is cross-shard transaction
    if (!confiremdTxn.isCrossShard()) {
      if (confiremdTxn.isConfirmed()) {
        console.log('--- Result ---');
        console.log('');
        console.log('Normal transaction');
        console.log(`${txnHash} is confirmed`);
        console.log('');
        console.log('please see detail in explorer:');
        console.log('');
        console.log('https://explorer.testnet.harmony.one/#/tx/' + txnHash);
        console.log('');
        process.exit();
      }
    }
    if (confiremdTxn.isConfirmed() && confiremdTxn.isCxConfirmed()) {
      console.log('--- Result ---');
      console.log('');
      console.log('Cross-Shard transaction');
      console.log(`${txnHash} is confirmed`);
      console.log('');
      console.log('please see detail in explorer:');
      console.log('');
      console.log('https://explorer.testnet.harmony.one/#/tx/' + txnHash);
      console.log('');
      process.exit();
    }
    //document.getElementById("checker").innerHTML = "You have received 1 ONE"+"\n"+"Check the transaction on https://explorer.testnet.harmony.one/#/tx/"+"\n"+"Your address is"+address;
  }
  transfer();
}

exports.initializeHarmony = initializeHarmony;
