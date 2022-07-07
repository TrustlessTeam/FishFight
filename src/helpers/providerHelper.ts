// Harmony SDK
import { Blockchain, HarmonyExtension } from "@harmony-js/core"
import { HarmonyAbstractConnector } from "@harmony-react/abstract-connector"
import { AbstractConnector } from "@web3-react/abstract-connector"
import Web3 from 'web3';


const envProvider: string = process.env.REACT_APP_FRONTEND_NETWORK || 'mainnet';

type getWalletProviderReturn = {
	provider: HarmonyExtension | Web3, // type of provider (harmony wallet, or web3 wallet)
	type: "harmony" | "web3" // will let sdk know what type of provider we are dealing with to initiate contracts correctly. If type === default, user is not signed in
}


export const getWalletProvider = async (connector: AbstractConnector | HarmonyAbstractConnector | undefined, library: Blockchain | any | undefined ): Promise<getWalletProviderReturn> => {
  let provider: HarmonyExtension | Web3

  // If connector is AbstractConnector (not a harmony wallet)
	// Get wallet provider from web3Provider
	const accounts = await library.provider.request({ method: 'eth_requestAccounts' });
	console.log(accounts)
	// Initiate provider instance
	provider = new Web3(library.provider);

	// Check if MetaMask is installed
 // MetaMask injects the global API into window.ethereum
	if (window.ethereum) {
		try {
			// check if the chain to connect to is installed
			if(envProvider === 'testnet') {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x6357D2E0' }], // chainId must be in hexadecimal numbers
				});
			} else {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x63564C40' }], // chainId must be in hexadecimal numbers
				});
			}
			
		} catch (error: any) {
			// This error code indicates that the chain has not been added to MetaMask
			// if it is not, then install it into the user MetaMask
			if (error.code === 4902) {
				try {
					await window.ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: '0x63564C40',
								rpcUrls: ['https://api.harmony.one'],
								chainName: 'Harmony Mainnet',
								nativeCurrency: {
									name: "Harmony ONE",
									symbol: "ONE",
									decimals: 18
								},
								blockExplorerUrls: ["https://explorer.harmony.one/"]
							},
						],
					});
				} catch (addError) {
					console.error(addError);
				}
			}
			console.error(error);
		}
	} else {
		// if no window.ethereum then MetaMask is not installed
		alert('MetaMask is not installed. Please consider installing it: https://metamask.io/download.html');
	}
	
	return new Promise(resolve => resolve({provider, type: "web3"}));
}