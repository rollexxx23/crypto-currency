//Test file

const Blockchain = require("../blockchain/blockchain") ;

const blockchain = new Blockchain() ;

blockchain.addBlock( {data : "initial"} ) ;

let previousTime , nextTime , nextBlock , timeDiff , average ;

const times = [] ;

for(let i=0 ; i<1000 ; i++) {
    previousTime = blockchain.chain[blockchain.chain.length - 1].timeStamp ;

    blockchain.addBlock({data: `block ${i}`}) ;

    nextBlock = blockchain.chain[blockchain.chain.length - 1] ;

    nextTime = nextBlock.timeStamp ;

    timeDiff = nextTime - previousTime ;

    times.push(timeDiff)  ;

    average = times.reduce((total,num) => (total + num))/times.length ;
    console.log(`TIME TO MINE BLOCK ${timeDiff}ms. DIFFICULTY : ${nextBlock.difficulty} , AVERAGE TIME : ${average}`)
}