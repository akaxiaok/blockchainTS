import {SHA256} from 'crypto-js';

class Transaction {
    fromAddress: string;
    toAddress: string;
    amount: number;

    constructor(fromAddress: string, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    public hash: string;
    public timestamp: number;
    public transactions: Array<Transaction>;
    public previousHash: string;
    private nonce: number = 0;

    constructor(timestamp: number, transactions: Array<Transaction>, previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(): string {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
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
    public chain: Array<Block> = [];
    public difficulty: number = 2;
    public pendingTransactions: Array<Transaction> = [];
    public miningRewards: number = 100;

    constructor() {
        this.chain = [this.createGenesisBlock()];
    }


    createGenesisBlock() {
        return new Block(Date.now(), [], '0');
    }

    getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock: Block) {
        newBlock.previousHash = this.getLastBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    minePendingTransactions(miningRewardAddress: string) {
        this.pendingTransactions.push(new Transaction('0', miningRewardAddress, this.miningRewards));
        let block = new Block(Date.now(), this.pendingTransactions, this.getLastBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    createTransaction(transaction: Transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address: string): number {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
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

const minerAddress = 'miner_address';

const testAddress1 = 'testAddress1';
const testAddress2 = 'testAddress2';


blockChain.createTransaction(new Transaction(testAddress1, testAddress2, 10));
blockChain.createTransaction(new Transaction(testAddress2, testAddress1, 5));

console.log('start the miner:');
blockChain.minePendingTransactions(minerAddress);
console.log('Balance of the miner:', blockChain.getBalanceOfAddress(minerAddress));
