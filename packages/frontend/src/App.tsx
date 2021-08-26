import React, { useState, useEffect, useContext } from 'react';
import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';

import Account from './components/Account';
import Balance from './components/Balance';
import UnityWindow from './components/UnityWindow';

import Logo from './img/harmony_logo.svg';
import { Contract } from '@harmony-js/contract';

import 'react-toastify/dist/ReactToastify.css';
import CreateFish from './components/CreateFish';
import { useWeb3React } from '@web3-react/core';

import { useHarmony } from './context/harmonyContext';
import { ContractContext } from './context/contractContext';

import { createFishFactoryContract, getFishFactoryContractFromConnector } from './helpers/contractHelper';

const App = () => {
	const { hmy, } = useHarmony();
	const { account, connector, library } = useWeb3React();

	const [fishFactoryContract, setFishFactoryContract] = useState<Contract | null>(createFishFactoryContract(hmy));

	useEffect(() => {
		if (!account) {
			setFishFactoryContract(null);
		}
	}, [account]);

	useEffect(() => {
		if (connector) {
			(async () => {
				const loadedContract = await getFishFactoryContractFromConnector(connector, library);
				setFishFactoryContract(loadedContract);
			})();
		}
	}, [connector, setFishFactoryContract]);

	const contractContext = {fishFactoryContract: fishFactoryContract!};

	return (
		<Wrapper>
			<Container>
				{account && fishFactoryContract != null &&
					<ContractContext.Provider value={contractContext}>
						<Topbar>
							<img src={Logo} alt="Harmony logo" />
							<Flex>
								<Balance />
								<Account />
							</Flex>
						</Topbar>
						<Content>
							{/* <UnityWindow /> */}
							<CreateFish/>
						</Content>
					</ContractContext.Provider>
				}
				{!account &&
					<Account/>
				}
			</Container>
			<ToastContainer
				position="bottom-right"
				newestOnTop={false}
				pauseOnFocusLoss={false}
				pauseOnHover={false}
				rtl={false}
			/>
		</Wrapper>
	);
};

const Flex = styled.div`
	display: flex;
	align-items: center;
`;

const Topbar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 74px;
	width: 100%;
`;

const Content = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	width: 100%;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	padding: 0px 24px;
	max-width: 1200px;
	margin: 0 auto;
`;

const Wrapper = styled.div`
	background-color: #0093e9;
	background-image: linear-gradient(160deg, #0093e9 0%, #80d0c7 100%);
	font-size: 1rem;
	color: white;
`;

export default App;
