import React, { useState } from 'react';
import './App.css';

import algosdk, {Algodv2, Transaction} from 'algosdk';
import {SessionWallet, allowedWallets} from 'algorand-session-wallet'

function App() {
  const [sw, setSw] = useState(new SessionWallet("TestNet"))
  const [addrs, setAddrs] = useState(sw.accountList())
  const [connected, setConnected] = useState(sw.connected())

  async function connect(choice: string){
    const w = new SessionWallet("TestNet", choice)

    if(!await w.connect()) return alert("Couldnt connect")

    setConnected(true)
    setAddrs(w.accountList())
    setSw(w)
  }

  function disconnect(){
    sw.disconnect()
    setConnected(false)
    setAddrs([])
    setSw(sw)
  }

  function getPayTxn(suggested: any): Transaction {
    const addr = sw.getDefaultAccount()
    // From me to me, 0 algos
    const txnobj = { from:addr, type:'pay', to:addr, ...suggested, amt: 0 }
    return new Transaction(txnobj)
  }

  async function sign(e: any) {

    const client = new algosdk.Algodv2("", "https://testnet.algoexplorerapi.io", 0)
    const suggested = await client.getTransactionParams().do()
    suggested.lastRound = suggested.firstRound + 10

    const pay_txn = getPayTxn(suggested)
    const [s_pay_txn] = await sw.signTxn([pay_txn])

    const {txId} = await client.sendRawTransaction([s_pay_txn.blob]).do()

    console.log("Submitting transaction: ", txId)
    const result = await waitForConfirmation(client, txId, 4)
    console.log("Result: ", result)
  }

  async function waitForConfirmation(algodclient: Algodv2, txId: string, timeout: number): Promise<any> {
    if (algodclient == null || txId == null || timeout < 0) {
      throw new Error('Bad arguments.');
    }

    const status = await algodclient.status().do();
    if (typeof status === 'undefined')
      throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;
  
    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
      const pending = await algodclient
        .pendingTransactionInformation(txId)
        .do();

      if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
          return pending;
  
        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
          throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
      }

      await algodclient.statusAfterBlock(currentround).do();
      currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}


  const options = []
  if(!connected){
    for (const [k,v] of Object.entries(allowedWallets)){
      options.push((<button key={k} onClick={()=>{connect(k)}}><img src={v.img(false)} alt='branding'></img>{k}</button>))
    }
  }else{
    options.push(<button key='disco' onClick={disconnect}>Sign out</button>)
    options.push(<button key='sign' onClick={sign}>Sign a txn</button>)
  }

  const accts =  addrs.map((a)=>{ return (<li key={a}>{a}</li>) })

  return (
    <div className="App">
      {options}
      <ul> {accts} </ul>
    </div>
  );
}

export default App;
