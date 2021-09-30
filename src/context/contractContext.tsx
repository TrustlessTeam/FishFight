import { createContext, useContext } from 'react';
import { Contract } from '@harmony-js/contract';

interface ContractContextInterface {
	fishFactoryContract: Contract;
}

export const ContractContext = createContext<ContractContextInterface | undefined>(undefined);

export const useContract = () => {
	const context = useContext(ContractContext);
	if (!context) {
		throw 'No contract provider';
	}
	return context;
};