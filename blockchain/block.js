const {GENESIS_DATA, MINE_RATE} = require('../config') ;
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require("hex-to-binary") ;

// A block will contain 4 properties => timeStamp, data, hash and previousHash.

class Block{

    constructor( {timeStamp, lastHash, hash, data, nonce, difficulty} ) {
        this.timeStamp = timeStamp ;               //PRO-TIP: while having more than 3 argument use mapping. We dont have to remember order
        this.lastHash = lastHash ;
        this.hash = hash ;
        this.data = data ;
        //nonce value will change to make sure hash matches the required condition
        this.nonce = nonce ;
        //difficulty is the no of consecutive zeroes that should be present beginning of hash
        this.difficulty = difficulty ;
    }

    static genesis() {
        return new Block(GENESIS_DATA) ;
    }

    static mineBlock( { lastBlock,data }) {
        let hash, timeStamp ;
     //  const timeStamp = Date.now() ;
        const lastHash = lastBlock.hash ;
        let {difficulty} = lastBlock;
        let nonce = 0 ;
        // do while to find hash with reqd condition using brute force
        do {
            nonce++ ;
            timeStamp = Date.now() ;
            difficulty = Block.adjustDifficulty({originalBlock:lastBlock , timeStamp}) ;
            hash = cryptoHash(timeStamp,lastHash,data, nonce , difficulty) ;
            //changing hex to binary allows multiple level of difficulty
        } while(hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)) ;

        

        return new this({
            timeStamp ,
            lastHash  ,
            data      ,
            difficulty,
            nonce,
            hash 
        }
        ) ;
    }

    static adjustDifficulty( {originalBlock , timeStamp}) {
        // difficulty will change depending pre defined mine rate and time to mine current block.
        const {difficulty} = originalBlock ;
        if(difficulty<1) {
            return 1 ;
        }
        const difference = (timeStamp - originalBlock.timeStamp) ;
       // console.log("difference",difference) ;
        if(difference > MINE_RATE ) {
            if(difficulty<1) {
                return 1 ;
            }
            return difficulty - 1 ;}
        return difficulty + 1 ;
        

        
    }

    

}

module.exports = Block ;

