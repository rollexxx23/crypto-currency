//native module
const crypto = require('crypto') ;
const hexToBinary = require('hex-to-binary') ;

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256') ;

    //hash object has an update function that takes string argument and will generate hash value

    hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));         //array of all inputs , and sort is to make sure it produces same hash with same arguments

    return(hash.digest('hex')) ;              //cryptographic term for representing the result
}

module.exports = cryptoHash ;