"use strict";
exports.__esModule = true;
var crypto_js_1 = require("crypto-js");
var Block = /** @class */ (function () {
    function Block(index, timestamp, data, previousHash) {
        if (previousHash === void 0) { previousHash = ''; }
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }
    Block.prototype.calculateHash = function () {
        return crypto_js_1.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    };
    return Block;
}());
var BlockChain = /** @class */ (function () {
    function BlockChain() {
        this.chain = [this.createGenesisBlock()];
    }
    BlockChain.prototype.createGenesisBlock = function () {
        return new Block(0, Date.now(), { message: 'hello world' }, '0');
    };
    BlockChain.prototype.getLastBlock = function () {
        return this.chain[this.chain.length - 1];
    };
    BlockChain.prototype.addBlock = function (newBlock) {
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    };
    BlockChain.prototype.isChainValid = function () {
        for (var i = 1; i < this.chain.length; i++) {
            var currentBlock = this.chain[i];
            var previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    };
    return BlockChain;
}());
var blockChain = new BlockChain();
blockChain.addBlock(new Block(1, Date.now(), { count: 1 }));
blockChain.addBlock(new Block(2, Date.now(), { count: 2 }));
console.log(JSON.stringify(blockChain, null, 2));
console.log('valid?', blockChain.isChainValid());
blockChain.chain[1].data = { count: 5 };
blockChain.chain[1].hash = blockChain.chain[1].calculateHash();
console.log('valid?', blockChain.isChainValid());
