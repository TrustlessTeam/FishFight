// Harmony SDK
import { Blockchain, Harmony, HarmonyExtension } from "@harmony-js/core"
import { HarmonyAbstractConnector } from "@harmony-react/abstract-connector"

// Web3 React
import { AbstractConnector } from "@web3-react/abstract-connector"

// Helpers
import { getExtension } from "./harmonyHelpers"

// Web3
import Web3 from 'web3';
import { getProvider } from "../utils/provider";

type getWalletProviderReturn = {
	provider: HarmonyExtension | Web3, // type of provider (harmony wallet, or web3 wallet)
	type: "harmony" | "web3" // will let sdk know what type of provider we are dealing with to initiate contracts correctly. If type === default, user is not signed in
}

// To-do useMemo
// export const getHarmonyProvider = (): getWalletProviderReturn => {
// 	const prov = getProvider()
// 	const provider = new Harmony(prov.url, {chainId: prov.chainId, chainType: prov.chainType})
// 	return {provider, type: "default"}
// }


export const getWalletProvider = async (connector: AbstractConnector | HarmonyAbstractConnector | undefined, library: Blockchain | any | undefined ): Promise<getWalletProviderReturn> => {
    let provider: HarmonyExtension | Web3
    
    const harmonyConnector = connector as HarmonyAbstractConnector;
    // If connector is a HarmonyAbstractConnector, it will contain windowKey (mathWallet or OneWallet).
	if (harmonyConnector.windowKey) {
		// Get wallet provider from window
		const extensionWallet: any = window[harmonyConnector.windowKey];
		// Start a HarmonyExtension instance
		provider = getExtension(extensionWallet);
		// With that harmony extension initiate the contract
        return new Promise(resolve => resolve({provider, type: "harmony"}));
	}

    // If connector is AbstractConnector (not a harmony wallet)
	// Get wallet provider from web3Provider
	await library.provider.request({ method: 'eth_requestAccounts' });
	
	// Initiate provider instance
	provider = new Web3(library.provider);

	// Check if MetaMask is installed
 // MetaMask injects the global API into window.ethereum
	if (window.ethereum) {
		try {
			// check if the chain to connect to is installed
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: '0x6357D2E0' }], // chainId must be in hexadecimal numbers
			});
		} catch (error: any) {
			// This error code indicates that the chain has not been added to MetaMask
			// if it is not, then install it into the user MetaMask
			if (error.code === 4902) {
				try {
					await window.ethereum.request({
						method: 'wallet_addEthereumChain',
						params: [
							{
								chainId: '0x6357D2E0',
								rpcUrls: ['https://api.s0.b.hmny.io'],
								chainName: 'Harmony Testnet',
								nativeCurrency: {
									name: "Harmony ONE",
									symbol: "ONE",
									decimals: 18
								},
								blockExplorerUrls: ["https://explorer.pops.one/"]
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
	// console.log(provider.eth.getChainId())
  //   if(await provider.eth.getChainId() != 1666700000) {
	// 		console.log("Wrong network selected!! Switch to Harmony Testnet")
	// 		await library.provider.request({ method: 'wallet_switchEthereumChain', params:[{chainId: '0x6357D2E0'}]});
	// 		return getHarmonyProvider()
	// 	}
    
    return new Promise(resolve => resolve({provider, type: "web3"}));
}