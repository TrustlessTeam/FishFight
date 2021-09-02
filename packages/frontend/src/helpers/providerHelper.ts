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
	provider: HarmonyExtension | Web3 | Harmony, // type of provider (harmony wallet, or web3 wallet)
	type: "harmony" | "web3" | "default" // will let sdk know what type of provider we are dealing with to initiate contracts correctly. If type === default, user is not signed in
}

// To-do useMemo
export const getHarmonyProvider = (): getWalletProviderReturn => {
	const prov = getProvider()
	const provider = new Harmony(prov.url, {chainId: prov.chainId, chainType: prov.chainType})
	return {provider, type: "default"}
}

export const getWalletProvider = async (connector: AbstractConnector | HarmonyAbstractConnector | undefined, library: Blockchain | any | undefined ): Promise<getWalletProviderReturn> => {
    let provider: HarmonyExtension | Web3 | Harmony
    
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
    
    
    return new Promise(resolve => resolve({provider, type: "web3"}));
}