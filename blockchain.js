const uuid = require('uuid/v1');
const sha256=require('sha256');
const currentnodeUrl=process.argv[3];
function blockchain() // constructor functions
	{
		this.chain=[];
		this.newTransactions=[];
		this.currentnodeUrl=currentnodeUrl;
		this.networknode=[];
		this.createNewBlock(100,'0','0');
	};
blockchain.prototype.createNewBlock=  function (nonce, previousBlockHash,hash)       // prototype
{
	const newBlock={
		index: this.chain.length +1,
		timestamp: Date.now(),
		Transactions: this.newPTransactions,
        nonce:nonce,
        hash:hash,
        previousBlockHash:previousBlockHash,
	};
this.newPTransactions=[];
this.chain.push(newBlock);
return newBlock;
}
blockchain.prototype.getLastBlock= function ()
{
	return this.chain[this.chain.length-1];
};
blockchain.prototype.createNewTransaction= function(amount, sender, recipient)
{
 const newTransaction={
	 amount:amount,
	 sender:sender,
	 recipient:recipient,
	 transactionID: uuid().split('-').join('')
 };
 	return newTransaction;
	this.newPTransactions.push(newTransaction);
	return this.getLastBlock()['index']+1;
};

blockchain.prototype.addtransactiontopt= function (transactionObj) {
	this.pendingtransaction.push(transactionObj);
	return this.getLastBlock()['index']+1;
};

blockchain.prototype.hashBlock= function (previousBlockHash,currentblockdata,nonce) {
	// return hashing value by sha256
	const dataAsString= previousBlockHash + nonce.toString() + JSON.stringify(currentblockdata);
	const hash =sha256(dataAsString);
	return hash;
};

blockchain.prototype.proofofwork= function (previousBlockHash,currentblockdata) // it will make the blockchain secure, count nonce from 0 to n till you get "0000" in starting
{
	let nonce=0;
	let hash=this.hashBlock(previousBlockHash,currentblockdata,nonce)
	while (hash.substring(0,4)!== '0000') {
		nonce++;
		hash= this.hashBlock(previousBlockHash,currentblockdata,nonce);
	}
	return nonce;
};
blockchain.prototype.chainisvalid = function (blockchain) {
	let validchain=true;
	for (var i = 0; i < blockchain.length; i++) {
		const currentblock=blockchain[i];
		const prevblock= blockchain[i-1];
		const blockhash= this.hashBlock(prevblock['hash'], {transaction: currentblock['transaction'], index: currentblock['index'],nonce: currentblock['nonce']});
		  if (blockhash.substring(0,4)!=='0000'){validchain=false;}
			if (currentblock['previousBlockHash']!== prevblock['hash']) {
				validchain=false;
			}
			};
			const genesisblock= blockchain[0];
			const correctnonce= genesisblock['nonce']==100;
			const correctPrevhash= genesisblock['previousBlockHash']=='0';
			const correcthash= genesisblock['hash']=='0';
			const correcttransaction= genesisblock['transaction'].length==0;
			if(!correctnonce || !correctPrevhash || !correcthash || !correcttransaction) {validchain=false;}
			return validchain;
};

blockchain.prototype.getblock = function (blockhash) {
	let correctBlock=null;
	this.chain.forEach(block=>{
		if(block.hash==blockHash) correctBlock=block;
	});
	return correctBlock;
};
blockchain.prototype.getTransaction=function (transactionID) {
	let correcttransaction =null;
	let correctBlock=null;
	this.chain.forEach(block=>{
	block.transaction.forEach(transaction =>{
		if(transaction.transactionID== transactionID){
			correcttransaction =transaction;
			currentblock=block;
		};
	});
	});
	return{ transaction: correcttransaction,
	block: block};
};
blockchain.prototype.getAddressdata = function (address) {
	const addressTransactions=[];
	this.chain.forEach(block =>{
		block.transactions.forEach(transaction =>{
			if(transaction.sender==address|| transaction.recipient==address){
				addressTransactions.push(transaction);
			};
		});
	});
	let balance=0;
	addressTransactions.forEach(transaction=>{
		if (transaction.recipient==address) {
			balence+=transaction.amount;
		}
		else if (transaction.sender==address) {
			balence-= transaction.amount;
		}
	});
	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};
module.exports=blockchain;
