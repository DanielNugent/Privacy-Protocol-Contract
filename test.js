var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/7ec3a8410d354058a323f5c73352e2c2'));
const abi = require("./artifacts/contracts/PrivacyPreserving.sol/PrivacyPreserving.json")["abi"]
address = "0x068729E25c1BEe3a67D0E3f2F9F47A351640D83C";
var MyContract = new web3.eth.Contract(abi, address);


MyContract.methods.getHashOfScans().call().then(console.log);

//0x068729E25c1BEe3a67D0E3f2F9F47A351640D83C


