const Block = require('./block') ;
const Blockchain = require('./blockChain') ;
const cryptoHash = require("../util/crypto-hash") ;
const Wallet = require('../wallet/wallet') ;
const Transaction = require('../wallet/transaction') ;

describe('Blockchain', () => {
    let blockchain , newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain() ;     //a new blockchain obj is created for each test.
        newChain = new Blockchain() ;

        originalChain = blockchain.chain ;
    });


    it("contains a chain array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true) ;
    }) ;

    it("starts with the genesis block" , () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis()) ;
    }) ;

    it("adds a new block to chain", () => {
        const newData = "dataa" ;
        blockchain.addBlock( { data:newData } ) ;

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData) ;
    }) ;


    describe('isValidChain()' , () => {
        describe("when the chain does not start with genesis block" , () => {
            it("returns false", () => {
                blockchain.chain[0] = {data: 'fake-genesis'} ;

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
            })
        }) ;

        describe("when the chain does not start with genesis block and has multiple blocks", () => {
            describe("and a last hash ref has changed", () => {
                it("returns false", () => {
                    blockchain.addBlock( { data: "data1" } ) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;

                    blockchain.chain[2].lastHash = "broken-lastHash" ;

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
                })
            }) ;

            describe("and the chain contains a block with an invalid field", () => {
                it("returns false", () => {
                    blockchain.addBlock({data:"data1"}) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;

                    blockchain.chain[2].data = "changed-data" ;
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
                })
            }) ;

            describe("and the chain contains a block with junked difficulty", () => {
                it("returns false", () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1] ;
                    const lastHash = lastBlock.hash ;
                    const timeStamp = Date.now() ;
                    const nonce = 0 ;
                    const data = [] ;
                    const difficulty = lastBlock.difficulty- 3 ;

                    const hash = cryptoHash(timeStamp,lastHash,difficulty,nonce,data) ;
                    const badBlock = new Block( {
                        timeStamp,lastHash,hash,nonce,difficulty,data
                    } ) ;
                    blockchain.chain.push(badBlock) ;

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
                })
            })

            describe("and the chain does not contains any block with an invalid field", () => {
                it("returns true", () => {
                    blockchain = new Blockchain() ; 
                    blockchain.addBlock({data:"data1"}) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;
                    blockchain.addBlock({data:'data4'}) ;
                    

                   
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true) ;
                }) ;
            }) ;

        })

       
            

    }) ;

    describe("replaceChain()", () => {
        let errorMock , logMock ;

        beforeEach(() => {
            errorMock = jest.fn() ;
            logMock = jest.fn() ;

            global.console.error = errorMock ;
            global.console.log = logMock ;
        })
        describe("when new chain is not longer", () => {
            beforeEach(() => {
                newChain.chain[0] = {new: "chhain"} ;
                blockchain.replaceChain(newChain.chain) ;

            })
            it("does not replace the chain", () => {
               
                expect(blockchain.chain).toEqual(originalChain) ;
            });

            it("logs an error", () => {
                expect(errorMock).toHaveBeenCalled() ;
            })
        }) ;

        describe("when new chain is longer", () => {
            beforeEach(() => {
                newChain.addBlock({data: "dataaa"}) ;
                newChain.addBlock({data: "dataaa23"}) ;
                newChain.addBlock({data: "dataaa45"}) ;

            }) ;
           
            describe("and the chain is not valid", () => {
                 it("does not replace the chain", () => {
                    newChain.chain[2].hash = "fakeHash" ;
                    blockchain.replaceChain(newChain.chain) ;
                    expect(blockchain.chain).toEqual(originalChain) ;

                    });
                }) ;
                describe("and the chain is valid", () => {
               
                    it("replaces the chain", () => {
                       blockchain.replaceChain(newChain.chain) ;
                       expect(blockchain.chain).toEqual(newChain.chain) ;
                       });
                   }) ;

            
            
        }) ;
        describe('and the `validateTransactions` flag is true', () => {
            it('calls validTransactionData()', () => {
              const validTransactionDataMock = jest.fn();
      
              blockchain.validTransactionData = validTransactionDataMock;
      
              newChain.addBlock({ data: 'foo' });
              blockchain.replaceChain(newChain.chain, true);
      
              expect(validTransactionDataMock).toHaveBeenCalled();
            });
          });
    }) ;

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;
    
        beforeEach(() => {
          wallet = new Wallet();
          transaction = wallet.createTransaction({ recipient: 'DUMMY-address', amount: 69 });
          rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });
    
        describe('and the transaction data is valid', () => {
          it('returns true', () => {
            newChain.addBlock({ data: [transaction, rewardTransaction] });
    
            expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
          //  expect(errorMock).not.toHaveBeenCalled();
          });
        });
    
        describe('and the transaction data has multiple rewards', () => {
          it('returns false and logs an error', () => {
            newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
    
            expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
           // expect(errorMock).toHaveBeenCalled();
          });
        });
    
        describe('and the transaction data has at least one malformed outputMap', () => {
          describe('and the transaction is not a reward transaction', () => {
            it('returns false and logs an error', () => {
              transaction.outputMap[wallet.publicKey] = 999999;
    
              newChain.addBlock({ data: [transaction, rewardTransaction] });
    
              expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
            //  expect(errorMock).toHaveBeenCalled();
            });
          });
    
          describe('and the transaction is a reward transaction', () => {
            it('returns false and logs an error', () => {
              rewardTransaction.outputMap[wallet.publicKey] = 999999;
    
              newChain.addBlock({ data: [transaction, rewardTransaction] });
    
              expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
            //  expect(errorMock).toHaveBeenCalled();
            });
          });
        });
    
        describe('and the transaction data has at least one malformed input', () => {
          it('returns false and logs an error', () => {
            wallet.balance = 9000;
    
            const evilOutputMap = {
              [wallet.publicKey]: 8900,
              fooRecipient: 100
            };
    
            const evilTransaction = {
              input: {
                timestamp: Date.now(),
                amount: wallet.balance,
                address: wallet.publicKey,
                signature: wallet.sign(evilOutputMap)
              },
              outputMap: evilOutputMap
            }
    
            newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
    
            expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
         //   expect(errorMock).toHaveBeenCalled();
          });
        });
    
        describe('and a block contains multiple identical transactions', () => {
          it('returns false and logs an error', () => {
            newChain.addBlock({
              data: [transaction, transaction, transaction, rewardTransaction]
            });
    
            expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        //    expect(errorMock).toHaveBeenCalled();
          });
        });
    }) ;

    
})



/*


describe('isValidChain()' , () => {
        describe("when the chain does not start with genesis block" , () => {
            it("returns false", () => {
                blockchain.chain[0] = {data: 'fake-genesis'} ;

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
            })
        }) ;

        describe("when the chain has multiple block and starts with genesis block" , () => {
            describe("and a lastHash ref has changed" , () => {
                it("returns false", () => {
                    blockchain.addBlock( { data: "data1" } ) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;

                    blockchain.chain[2].lastHash = "broken-lastHash" ;

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
                })
            }) ;

            describe("and the chain contains a block with an invalid field" , () => {
                it("returns false", () => {
                    blockchain.addBlock({data:"data1"}) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;

                    blockchain.chain[2].data = "changed-data" ;
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false) ;
                }) 
            })
        }) ;

        describe("and the chain does not contain any invalid blocks" , () => {
                    blockchain.addBlock({data:"data1"}) ;
                    blockchain.addBlock({data:'data2'}) ;
                    blockchain.addBlock({data:"data3"}) ;

                   
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true) ;
        })
    })




*/