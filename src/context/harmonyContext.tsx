// React
import React, { createContext, useContext, useState, useCallback } from 'react';

// Harmony SDK
import { Harmony } from '@harmony-js/core';
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';

// Utils
import { getProvider } from '../utils/provider';

// Types
type HarmonyProviderProps = { children: React.ReactNode };

interface HamonyProviderContext {
	hmy: Harmony;
	balance: string | undefined;
	fetchBalance: (account: string) => Promise<void>;
	resetBalance: () => void;
}

// Get provider
const provider = getProvider();

// New Harmony instance
const hmy = new Harmony(provider.url, { chainId: provider.chainId, chainType: provider.chainType });

// Harmony context provider
const HarmonyContext = createContext<HamonyProviderContext | undefined>(undefined);

export const HarmonyProvider = ({ children }: HarmonyProviderProps) => {
	const contextBalance = useBalance();

	const value: HamonyProviderContext = {
		hmy,
		...contextBalance,
	};

	return <HarmonyContext.Provider value={value}>{children}</HarmonyContext.Provider>;
};

// Account balance utilities that will be included in HarmonyContext
const useBalance = () => {
	const [balance, setBalance] = useState<string>();

	const fetchBalance = useCallback(
		async (account: string) => {
			const address = isBech32Address(account) ? account : toBech32(account);
			const balance = await hmy.blockchain.getBalance({ address });
			const parsedBalance = fromWei(hexToNumber(balance.result), Units.one);
			setBalance(parsedBalance);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[hmy, setBalance],
	);

	const resetBalance = () => {
		setBalance(undefined);
	};

	return {
		balance,
		fetchBalance,
		resetBalance,
	};
};

// useContext 
export const useHarmony = () => {
	const context = useContext(HarmonyContext);
	if (!context) {
		// eslint-disable-next-line no-throw-literal
		throw 'No Harmony provider';
	}
	return context;
};
