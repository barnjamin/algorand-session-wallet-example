import React, { useState } from 'react';
import './App.css';
import {sendWait, getSuggested, getPayTxn} from './algorand'

import {SessionWallet, allowedWallets} from 'algorand-session-wallet'

function App() {
  const [sw, setSw] = useState(new SessionWallet("TestNet"))
  const [addrs, setAddrs] = useState(sw.accountList())
  const [connected, setConnected] = useState(sw.connected())

  async function connect(choice: string){
    const w = new SessionWallet("TestNet", choice)

    if(!await w.connect()) return alert("Couldnt connect")

    setConnected(w.connected())
    setAddrs(w.accountList())
    setSw(w)
  }

  async function disconnect(){
    sw.disconnect()
    setConnected(false)
    setAddrs([])
    setSw(sw)
  }

  async function sign(e: any) {
    const pay_txn = getPayTxn(await getSuggested(), sw.getDefaultAccount())
    const [s_pay_txn] = await sw.signTxn([pay_txn])

    console.log("Sending txn")
    const result = await sendWait([s_pay_txn.blob])
    console.log(result)
  }



  const options = []
  if(!connected){
    for (const [k,v] of Object.entries(allowedWallets)){
      options.push((<button key={k} onClick={()=>{connect(k)}}><img src={v.img(false)} alt='branding'></img>{v.displayName()}</button>))
    }
  }else{
    options.push(<button key='disco' onClick={disconnect}>Sign out</button>)
    options.push(<button key='sign' onClick={sign}>Sign a txn</button>)
  }

  const accts =  addrs.map((a)=>{ return (<li key={a}>{a}</li>) })

  return (
    <div className="App">
      <div className='actions'>
        {options}
      </div>
      <ul className='acct-list'> {accts} </ul>
    </div>
  );
}

export default App;
