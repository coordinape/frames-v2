import {AssetTransfersCategory} from "alchemy-sdk";

const addr = '0x333d0EBc54707c0a9D92caC749B3094c28a0E111';


import { Alchemy, Network } from "alchemy-sdk";



export async function findContractsDeployedByAddress(deployerAddress: string) {
  try {
    // Get all outgoing transactions from this address
    const txns = await alchemy.core.getAssetTransfers({
      fromAddress: deployerAddress,
      category: [AssetTransfersCategory.EXTERNAL],
    });

    // Filter transactions where there's contract creation
    // Contract creation transactions have a null 'to' field
    const contractCreationTxns = txns.transfers.filter(txn => txn.to === null);

    // You can then get transaction receipts to find the contract addresses
    const contractAddresses = [];

    for (const txn of contractCreationTxns) {
      if (txn.hash) {
        const receipt = await alchemy.core.getTransactionReceipt(txn.hash);
        if (receipt && receipt.contractAddress) {
          contractAddresses.push({
            contractAddress: receipt.contractAddress,
            transactionHash: txn.hash
          });
        }
      }
    }

    return contractAddresses;
  } catch (error) {
    console.error("Error fetching deployed contracts:", error);
    throw error;
  }
}