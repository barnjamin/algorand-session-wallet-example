import algosdk, {Transaction, waitForConfirmation} from 'algosdk';

const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const host = "http://localhost"
const port = 4001
export const client = new algosdk.Algodv2(token, host, port)

export async function sendWait(txns: any[]) {
    const {txId} = await client.sendRawTransaction(txns).do()
    const result = await waitForConfirmation(client, txId, 4)
    return result
}
export async function getSuggested(){
    const suggested = await client.getTransactionParams().do()
    suggested.lastRound = suggested.firstRound + 10
    return suggested
}

export function getPayTxn(suggested: any, addr: string): Transaction {
    const txnobj = { 
        from:addr, 
        type:'pay', 
        to:addr, 
        ...suggested, 
    }
    return new Transaction(txnobj)
}

