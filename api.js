  const express= require('express');
	const app=express();
  const bodyparser = require('body-parser');
  const Blockchain = require('./blockchain');
  const uuid = require('uuid/v1');
  const port = process.argv[2];
  const re = require('request-promise');
  const nodeAddress= uuid().split('-').join(); //create unique ID (xxxx-xxxx-xxxx-xxxx).
  const cimcoin=new Blockchain();
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({extented:false}));
	app.get('/blockchain', function(req,res)
		{     res.send(cimcoin);
  });
  app.post('/Transactions',function(req, res)
  {
    const blockIndex = cimcoin.createNewTransaction(req.body.amount, req.body.sender,req.body.recipient);
    res.json({note:"string will add in block ${blockIndex}"});
    console.log(blockIndex);
  });
  app.get('/mine', function(req, res)
  {
      const lastblock = cimcoin.getLastBlock();
      const previousBlockHash=lastblock['hash'];
      const currentblockdata= {
        Transactions: cimcoin.PTransactions,
        index: lastblock['index']+1
      }
      const nonce= cimcoin.proofofwork(previousBlockHash, currentblockdata);
      const blockhash=cimcoin.hashBlock(previousBlockHash,currentblockdata,nonce);
      //cimcoin.createNewTransaction(18.5,"00","");                                  to be added after mining
      const newBlock= cimcoin.createNewBlock(nonce,previousBlockHash,blockhash);
      const requestPromises=[];
      cimcoin.networknode.forEach(networkNodeUrl=>{
        const requestOptions={
          uri:networkNodeUrl+'/recieve-new-block',
          method:POST,
          body:{newblock:newblock},
          json:true
        };
        requestPromises.push(re(requestOptions));
      });
      Promise.all(requestPromises)
      .then(data=>{
        const requestOptions={
          uri:cimcoin.currentnodeUrl+'/transactions/broadcast',
          body:{
          method: 'POST',
            amount:18.5,
            sender:"00",
            recipient:nodeAddress
          },
          json:true
        };
        return re(requestOptions);
      });
      res.json({
        note:"New block mined",
        block: newBlock
      });
  });
  app.post('/transactions',function (req,res){
    const newTransaction=req.body;
    const blockIndex=cimcoin.addtransactiontopt(newTransactions);
    res.json({note:'transaction will be added in block'});
  })

  app.post('/transactions/broadcast', function (req,res) {
     const newTransaction=cimcoin.createNewTransaction(req.body.amount, req.body.sender,req.body.recipient);
    cimcoin.addtransactiontopt(newTransactions);
    const requestPromises=[];
    cimcoin.networknode.forEach(networkNodeUrl =>{
      const requestOptions={
        uri: networkNodeUrl+'/transactions',
        method:POST,
        body:newTransactions,
        json:true
      };
      requestPromises.push(re(requestOptions));
    });
    Promise.all(requestPromises);
    then(data =>{
      res.json({note:'transaction create and broadcast successfully'});         // 2 Error occured: .then not working .. token misplace
     });
  });
  app.post('/recieve-new-block', function (req,res){
    const newBlock=req.body.newBlock;
    const lastBlock = cimcoin.getLastBlock();
    const correcthash=lastBlock.hash==newBlock.previousBlockHash;
    const correctIndex= lastBlock['index']+1==newBlock['idex'];
    if(correcthash && correctIndex){
      cimcoin.chain.push(newBlock);
      cimcoin.pendingtransaction=[];
      res.json({
        note:'new block recieved and accepted',
        newBlock:newBlock
      });
    }
    else {
      res.json({
        note:'new block rejected',
        newBlock: newBlock
      });
    }
  });

  //register a node and broadcast it in entire network
  app.post('/register-and-broadcast-node',function (req,res) {
    const newNodeUrl= req.body.newNodeUrl;
    if (cimcoin.networknode.indexOf(newNodeUrl)==-1) {
      cimcoin.networknode.push(newNodeUrl);
    }
    const regNodeP=[];
    cimcoin.networknode.forEach(networkNodeUrl => {
      const requestoptions={
        url:networkNodeUrl+'/register-node',
        method:'POST',
        body:{newNodeUrl:newNodeUrl},
        json:true
      };
      regNodeP.push(re(requestoptions));
    });
    Promise.all(regNodeP)
    .then(data =>{
        const bulkRegisteroptions={
          url:newNodeUrl+'/register-nodes-bulk',
          method:'POST',
          body:{allnetworknodes:[cimcoin.networknode, cimcoin.currentnodeUrl]},
          json:true
        };
        return re(bulkRegisteroptions);
    });
    then(data =>{
      res.json({note:'new node registred successfully'});   // Error 1: .then not working .. token misplace
    });                                                  // Node not registering successfully
  });
  app.post('/register-node',function (req,res) {
      const newNodeUrl=req.body.newNodeUrl;
      const notpresent=cimcoin.networknode.indexOf(newNodeUrl)==-1;
      const notcurrentnode =cimcoin.currentnodeUrl !== newNodeUrl;
      if(notpresent && notcurrentnode){cimcoin.networknode.push(newNodeUrl);}
      res.json({note:"new node registred successfully"});

  });
  app.post('/register-nodes-bulk', function(req,res){
    const allVarnodes=req.body.allnetworknodes;
    allnetworknodes.forEach(networkNodeUrl =>{
    const notApresent=cimcoin.networknode.networkNodeUrl==-1;
    const notcurrentnode=cimcoin.currentnodeUrl!==networkNodeUrl;
    if(notApresent && notcurrentnode) cimcoin.networknode.push(networkNodeUrl);
    });
    res.json({note:'bulk registred successfully'});
  });

  app.get('/consensus',function(req,res){
    const requestPromises=[];
    cimcoin.networknode.forEach(networkNodeUrl=>{
      const requestOptions= {
      uri: networkNodeUrl+'/blockchain',
      method:'GET',
      json:true
      };
      requestPromises.re(requestOptions);
    });
    Promise.all(requestPromises)
    .then(Blockchains=>{
      const currentchainlength=cimcoin.chain.length;
      let maxChainlength = currentchainlength;
      let newlongestchain=null;
      let newptransactions=null;
      Blockchains.forEach(blockchain =>{
        if(blockchain.chain.length>maxChainlength){
          maxChainlength= blockchain.chain.length;
          newlongestchain= blockchain.chain;
          newptransactions= blockchain.pendingtransaction;
        };
      });
      if (!newlongestchain || (newlongestchain && !cimcoin.chainisvalid(newlongestchain))) {
        res.json({note:'current chain is not replaced', chain: cimcoin.chain});
      }
      else if (newlongestchain && cimcoin.chainisvalid(newlongestchain)) {
          cimcoin.chain= newlongestchain;
          cimcoin.pendingtransaction=newptransactions;
          res.json({note:'this chain is replaced', chain:cimcoin.chain});
      }
    });
  });

app.get('/block/:blockHash', function(req,res){
    const blockHash =req.params.blockHash;
    const correctBlock=cimcoin.getblock(blockHash);
    res.json({
      block:correctBlock
    });
});
app.get('/transaction/:transactionID', function(req,res){
  const transactionId=req.params.transactionId;
  const transactiondata=cimcoin.getTransaction(transactionId);
  res.json({
    transaction:transactiondata.transaction,
    block:transactiondata.block
  });
});
app.get('/address/:address', function(req,res){
const address=req.params.address;
const addsressdata =cimcoin.getAddressdata(address);
res.json({
  addressData: addressData
});
});
app.get('/blockEx', function (req,res) {
  res.sendFile('./blockEx.html',{root:__dirname});
});

app.listen(port, function () {
    console.log('listening on port ${port} ...');
  });
