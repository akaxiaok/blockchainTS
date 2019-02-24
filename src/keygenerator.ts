import {ec} from 'elliptic';

const ecInstance = new ec('secp256k1');

const key = ecInstance.genKeyPair();


const publicKey = key.getPublic('hex');

const privateKey = key.getPrivate('hex');

console.log('public:', publicKey);
console.log('private', privateKey);