const MINE_RATE = 1000 ;
const INITIAL_DIFFICULTY = 3 ;
const STARTING_BALANCE = 1000 ;

const GENESIS_DATA = {
    timeStamp: '1' ,
    lastHash: '----' ,
    hash : "hash-1" ,
    data : [] ,
    nonce : 0 ,
    difficulty : INITIAL_DIFFICULTY 
} ;

const REWARD_INPUT = { address: "*mining-rewards"} ;

const MINING_REWARD = 50 ;


module.exports = {GENESIS_DATA , MINE_RATE, STARTING_BALANCE, REWARD_INPUT , MINING_REWARD} ;