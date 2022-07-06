const {STARTING_BALANCE} = require('../config') ;
const { ec } = require('../util/index');
const cryptoHash = require('../util/crypto-hash') ;
const Transaction = require('./transaction');
// a wallet will contain => balance , a pair of public and private key
// data will be signed using keypair that can be verified later( using elliptic library function)


class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
    
        this.keyPair = ec.genKeyPair();
    
        this.publicKey = this.keyPair.getPublic().encode('hex');
      }
    
      sign(data) {
        return this.keyPair.sign(cryptoHash(data))
      }

      createTransaction( {recipient,amount, chain} ) {
        if (chain) {
          this.balance = Wallet.calculateBalance({
            chain,
            address: this.publicKey
          });
        }
        
        if (amount > this.balance) {
          throw new Error('Amount exceeds balance');
        }
        return new Transaction({ senderWallet: this, recipient, amount });
      }

      static calculateBalance ( {chain, address} ) {
        let hasConductedTransaction = false;
        let outputsTotal = 0;
    
        for (let i=chain.length-1; i>0; i--) {
          const block = chain[i];
    
          for (let transaction of block.data) {
            if (transaction.input.address === address) {
              hasConductedTransaction = true;
            }
    
            const addressOutput = transaction.outputMap[address];
    
            if (addressOutput) {
              outputsTotal = outputsTotal + addressOutput;
            }
          }
    
          if (hasConductedTransaction) {
            break;
          }
        }
    
        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
      }
    
} ;


module.exports = Wallet ;