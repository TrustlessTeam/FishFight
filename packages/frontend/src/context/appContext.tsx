import { createContext } from 'react';
import { Contract } from '@harmony-js/contract';

interface AppProviderContext {
	account: string | null | undefined;
	fishFactoryContract: Contract | null;
	fetchBalance: (account: string) => Promise<void>;
	resetBalance: () => void;
}

export const AppContext = createContext(null);