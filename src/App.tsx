import { useState } from 'react';
import './App.css';
import {sendWait, getSuggested, getPayTxn} from './algorand'
import {PopupPermissions} from './PopupPermissions'
import { PermissionResult, SessionWallet, SignedTxn, allowedWallets} from 'algorand-session-wallet'


const pprops = {
	isOpen: false,
	result: (s: string): void => {}

}

function App() {
	
  const [popupProps, setPopupProps] = useState(pprops)

  const permPopupCallback = {
  	async request(pr: PermissionResult): Promise<SignedTxn[]> {
	    // set a local var that will be modified in the popup
	    let result = ""
	    function setResult(res: string){ result = res}

  	    setPopupProps({ isOpen:true, result: setResult })		
	    
	    // Wait for it to finish

	    const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
	    async function wait(): Promise<SignedTxn[]> {
		    while(result === "") await timeout(50);

		    if(result === "approve") return pr.approved()
		    return pr.declined()
	    }

	    //get signed
	    const txns = await wait()

	    //close popup
	    setPopupProps(pprops)

	    //return signed
	    return txns
      }
  }

  const [sw, setSw] = useState(new SessionWallet("TestNet", permPopupCallback))
  const [addrs, setAddrs] = useState(sw.accountList())
  const [connected, setConnected] = useState(sw.connected())


  async function connect(choice: string){


    const w = new SessionWallet("TestNet", permPopupCallback, choice)

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
    const suggested = await getSuggested()
    const pay_txn = getPayTxn(suggested, sw.getDefaultAccount())

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
    <div id='app' className="App">
      <div className='actions'>
        {options}
      </div>
      <ul className='acct-list'> {accts} </ul>
      <PopupPermissions {...popupProps} />
    </div>
  );
}

export default App;
