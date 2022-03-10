// React
import React from 'react';

// Styled Components
import styled from 'styled-components';

// Web3 React
import { useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';

// Utils
import { connectorsByName } from '../utils/connectors';

// Helpers
import { mapWallets } from '../helpers/walletHelpers';

export interface Props {
	closeModal: () => void;
}

const Wallets = ({ closeModal }: Props) => {
	const { activate } = useWeb3React();

	const handleClick = (connector: AbstractConnector) => () => {
		// Activate will take connector as an argument
		// And then initialize web3React context with a provider.
		// Provider depends on the connector (i.e wallet) that has been chosen
		activate(connector);
		closeModal();
	}; 

	return (
		<WalletsComponent>
			{
				// From the wallets that we support
			
			Object.keys(connectorsByName).map(name => (
				<WalletItem key={name} onClick={handleClick(connectorsByName[name])}>
					<WalletImg src={mapWallets[name].image} />
					{mapWallets[name].name}
				</WalletItem>
			))}
		</WalletsComponent>
	);
};

const WalletImg = styled.img`
	width: 42px;
	height: 42px;
	margin-bottom: 1rem;
`;

const WalletsComponent = styled.div`
	/* display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	overflow: hidden; */
	display: flex;
	min-width: 320px;
	flex-flow: column;
	justify-content: space-between;
	align-items: center;
	z-index: 20;
`;

const WalletItem = styled.div`
	width: 100%;
	min-height: 140px;
	padding: 8px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	cursor: pointer;
	font-size: 1.55rem;
	border-radius: 0px;
	border: 1px solid rgba(195, 195, 195, 0.14);
`;

export default Wallets;
