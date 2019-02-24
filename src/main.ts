import {BlockChain, Transaction} from './blockchain';
import {ec} from 'elliptic';

const ecInstance = new ec('secp256k1');
const myPrivateKey = 'dd58008532472fe2d20af77d3a53356adbc1ec478f2a3ee8fb09b6f0db1af260';
// const myPublicKey = '04b910d8b22f24d1b81b89e8c4a203b0b7f2862ee40b622f173dd0fa8ae96082a5a11212a6a54ea01e8f86d176c0a257afce8ce889ff922bf43424cb5c84d0e6ca';


const myKey = ecInstance.keyFromPrivate(myPrivateKey);
const myWalletAddress = myKey.getPublic('hex');
console.log(myWalletAddress);

let blockChain = new BlockChain();
const minerAddress = 'miner_address';


console.log('start the miner:');
blockChain.minePendingTransactions(myWalletAddress);
console.log('Balance of the miner:', blockChain.getBalanceOfAddress(minerAddress));
console.log('Balance of my wallet:', blockChain.getBalanceOfAddress(myWalletAddress));

const tx1 = new Transaction(myWalletAddress, 'public key', 2);
const tx2 = new Transaction(myWalletAddress, 'public key', 100);
tx1.signTransaction(myKey);
tx2.signTransaction(myKey);
blockChain.addTransaction(tx1);
blockChain.addTransaction(tx2);
console.log('start the miner:');
blockChain.minePendingTransactions(minerAddress);
//wow
console.log('Balance of the miner:', blockChain.getBalanceOfAddress(minerAddress));
console.log('Balance of my wallet:', blockChain.getBalanceOfAddress(myWalletAddress));




