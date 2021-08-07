## Algorand Session Wallet Example
----------------------------------

```sh
npm -i algorand-session-wallet
```



```js
 const [sw, setSw] = useState(new SessionWallet("TestNet"))

//...

  async function connect(choice: string){
    const w = new SessionWallet("TestNet", choice)

    if(!await w.connect()) return alert("Couldnt connect")
    // ...

    setSw(w)
  }

//...

  async function sign(e: any) {
    const pay_txn = getPayTxn(await getSuggested(), sw.getDefaultAccount())
    const [s_pay_txn] = await sw.signTxn([pay_txn])

    console.log("Sending txn")
    const result = await sendWait([s_pay_txn.blob])
    console.log(result)
  }

//...

```
