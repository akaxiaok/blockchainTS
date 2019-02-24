import {SHA256} from 'crypto-js';

class Block {
    public hash: string;
    public index: number;
    public timestamp: number;
    public data: object;
    public previousHash: string;

    constructor(index: number, timestamp: number, data: object, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();

    }

    calculateHash(): string {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }

}

class BlockChain {
    public chain: Array<Block>;

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }


    createGenesisBlock() {
        return new Block(0, Date.now(), {message: 'hello world'}, '0');
    }

    getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock: Block) {
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false
            }
        }
        return true;
    }

}

let blockChain = new BlockChain();

blockChain.addBlock(new Block(1, Date.now(), {count: 1}));
blockChain.addBlock(new Block(2, Date.now(), {count: 2}));

console.log(JSON.stringify(blockChain, null, 2));

console.log('valid?', blockChain.isChainValid());

blockChain.chain[1].data = {count: 5};
blockChain.chain[1].hash = blockChain.chain[1].calculateHash();
console.log('valid?', blockChain.isChainValid());
