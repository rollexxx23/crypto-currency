const Transaction = require('../wallet/transaction')

class TransactionMiner {
    constructor( {blockchain, transactionPool, wallet , pubsub} ) {
        this.blockchain = blockchain ;
        this.transactionPool = transactionPool ;
        this.wallet = wallet ;
        this.pubsub = pubsub ;
    }

    mineTransactions () {
        // get the transactions valid transaction 
        const validTransactions = this.transactionPool.validTransactions();
        //generate miners reward
        validTransactions.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
          );
      

        // add a block consisting of these transaction to the blockchain
        this.blockchain.addBlock({ data: validTransactions });
        //broadcast the updated blockchain
        this.pubsub.broadcastChain();
        //clear the pool
        this.transactionPool.clear();
    }
}



module.exports = TransactionMiner ;