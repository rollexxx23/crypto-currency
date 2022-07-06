const lightningHash = (data) => {
  return data + "hash" ;
}
// simple block contains data , hash and previous hash


class Block {
  constructor(data,hash, lastHash) {
    this.data = data ;
    this.hash = hash ;
    this.lastHash = lastHash ;

  }
}

class BlockChain {
  // first block of the blockchain called genesis block.
  
  constructor() {
    const genesis = new Block('gen-data','gen-hash', 'prev-hash') ;
    this.chain = [genesis] ;
  }

  addBlock (data) {
  //hashvalue of the previous block  
  const lastHash = this.chain[this.chain.length-1].hash ;
  // hashing function
  const hash =lightningHash(data+lastHash) ;
  
  const block = new Block(data, hash , lastHash) ;

  this.chain.push(block) ;
}
}

// new block chain is made :)
const simpleBlockchain = new BlockChain ;
simpleBlockchain.addBlock('add1') ;
simpleBlockchain.addBlock('add2') ;
simpleBlockchain.addBlock('add3') ;



console.log(simpleBlockchain) ;
