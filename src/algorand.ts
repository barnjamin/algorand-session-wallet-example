import algosdk, {Transaction} from 'algosdk';

const client = new algosdk.Algodv2("", "https://testnet.algoexplorerapi.io", 0)

export async function sendWait(txns: any[]) {
    const {txId} = await client.sendRawTransaction(txns).do()
    const result = await waitForConfirmation(txId, 4)
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


export async function waitForConfirmation(txId: string, timeout: number): Promise<any> {
    if (client == null || txId == null || timeout < 0) {
        throw new Error('Bad arguments.');
    }

    const status = await client.status().do();
    if (typeof status === 'undefined')
        throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;

    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
        const pending = await client 
        .pendingTransactionInformation(txId)
        .do();

        if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
            return pending;

        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
            throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
        }

        await client.statusAfterBlock(currentround).do();
        currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

