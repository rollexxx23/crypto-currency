const Block = require('./block') ;
const cryptoHash = require("../util/crypto-hash") ;
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Wallet = require('../wallet/wallet') ;
const Transaction = require('../wallet/transaction') ;

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()] ;       // the first block of the chain will be genesis block
    }

    addBlock ({data}) {
        const newBlock = Block.mineBlock({                          //mineBlock needs lastBlock and data as argument
            lastBlock : this.chain[this.chain.length - 1] ,         
            data 
        }) ;

        this.chain.push(newBlock) ;                                    //push
    }
    //chain replacement will take place only when new chain is greater than existing chain and new chain contains all valid blocks
    replaceChain (chain,validateTransactions,  onSuccess) {
        if(chain.length <= this.chain.length) {
            console.error("new chain must be longer") ;
            return ;
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error("all blocks must be valid") ;
            return ;
        }

        if(validateTransactions && !this.validTransactionData( {chain} )) {
          console.error('The incoing chain has invalid data') ;
          return ;
        }
        if(onSuccess) onSuccess() ;
        console.log("replaced") ;
        this.chain = chain ;
 
    }

    validTransactionData({ chain }) {
        for (let i=1; i<chain.length; i++) {
          const block = chain[i];
          const transactionSet = new Set();
          let rewardTransactionCount = 0;
    
          for (let transaction of block.data) {
            if (transaction.input.address === REWARD_INPUT.address) {
              rewardTransactionCount += 1;
    
              if (rewardTransactionCount > 1) {
                console.error('Miner rewards exceed limit');
                return false;
              }
    
              if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                console.error('Miner reward amount is invalid');
                return false;
              }
            } else {
              if (!Transaction.validTransaction(transaction)) {
                console.error('Invalid transaction');
                return false;
              }
    
              const trueBalance = Wallet.calculateBalance({
                chain: this.chain,
                address: transaction.input.address
              });
    
              if (transaction.input.amount !== trueBalance) {
                console.error('Invalid input amount');
                return false;
              }
    
              if (transactionSet.has(transaction)) {
                console.error('An identical transaction appears more than once in the block');
                return false;
              } else {
                transactionSet.add(transaction);
              }
            }
          }
        }
    
        return true;
      }
    


    //chain to be validated it must:
    //1. have correct block fields present
    //2. lastHash is actually hash of the previous block
    //3. Valid hash is present
    static isValidChain (chain)  {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false ;
        } 

        for(let i=1 ; i<chain.length ; i++) {
            const block = chain[i] ;

            const actualLastHash = chain[i-1].hash ; 
            const actualDifficulty = chain[i-1].difficulty ;    

            const {timeStamp , lastHash , hash ,nonce,difficulty, data} = block ;

            if(lastHash !== actualLastHash) {
                return false ;                  //checks point no. 2
            }

            const validatedHash = cryptoHash(timeStamp,lastHash,data,nonce,difficulty) ;
            if(validatedHash !==hash) return false ;     //checks point no. 3

            if(Math.abs(actualDifficulty - difficulty)>1) return false ;
        
        }
       return true ;      // return true only all the checks pass
    }
}




module.exports = Blockchain ;