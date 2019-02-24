import {SHA256} from 'crypto-js';

class Block {
    public hash: string;
    public index: number;
    public timestamp: number;
    public data: object;
    public previousHash: string;
    private nonce: number;

    constructor(index: number, timestamp: number, data: object, previousHash: string = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(): string {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty: number) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined:', this.hash);
    }

}

class BlockChain {
    public chain: Array<Block>;
    public difficulty: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
    }


    createGenesisBlock() {
        return new Block(0, Date.now(), {message: 'hello world'}, '0');
    }

    getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock: Block) {
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.mineBlock(this.difficulty);
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

console.log('mine block 1');
blockChain.addBlock(new Block(1, Date.now(), {count: 1}));
console.log('mine block 2');
blockChain.addBlock(new Block(2, Date.now(), {count: 2}));

// console.log(JSON.stringify(blockChain, null, 2));

console.log('valid?', blockChain.isChainValid());

blockChain.chain[1].data = {count: 5};
blockChain.chain[1].hash = blockChain.chain[1].calculateHash();
console.log('valid?', blockChain.isChainValid());
console.log(SHA256(JSON.stringify(blockChain)).toString());