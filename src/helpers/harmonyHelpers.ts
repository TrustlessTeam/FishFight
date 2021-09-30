/* eslint-disable @typescript-eslint/no-unused-vars */

import { ExtensionInterface, Harmony, HarmonyExtension } from '@harmony-js/core';
import { getProvider } from '../utils/provider';

export const isHmyLibrary = (library: any): boolean => library?.messenger?.chainType === 'hmy';

export const getExtension = (wallet: ExtensionInterface): HarmonyExtension => {
	// Get provider info 
	const provider = getProvider();
	
	// Create a blockchain instance support wallet injection
	return new HarmonyExtension(wallet, {
		chainId: provider.chainId,
		chainType: provider.chainType,
		chainUrl: provider.url,
	});
};
 