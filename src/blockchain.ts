import {SHA256} from 'crypto-js';
import {ec} from 'elliptic';

const ecInstance = new ec('secp256k1');

export class Transaction {
    fromAddress: string;
    toAddress: string;
    amount: number;
    signature: ec.Signature;

    constructor(fromAddress: string, toAddress: string, amount: number) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey: ec.KeyPair) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transaction for other wallets!');
        }
        const hasTx = this.calculateHash();
        const sig = signingKey.sign(hasTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    isValid(): boolean {
        if (this.fromAddress === '0') {
            return true
        }
        if (!this.signature) {
            throw new Error('No signature');
        }

        const publicKey = ecInstance.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

export class Block {
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

    hasValidTransactions(): boolean {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false
            }
        }
        return true;
    }

}

export class BlockChain {
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


    minePendingTransactions(miningRewardAddress: string) {
        this.pendingTransactions.push(new Transaction('0', miningRewardAddress, this.miningRewards));
        let block = new Block(Date.now(), this.pendingTransactions, this.getLastBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [];
    }

    addTransaction(transaction: Transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Must have from and to address!');
        }

        if (!transaction.isValid()) {
            throw new Error('Transaction not valid!!');
        }

        if (transaction.amount > this.getBalanceOfAddress(transaction.fromAddress)) {
            throw new Error('Transaction not valid!!. Someone doesn\'t have enough coins!');
        }

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

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
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