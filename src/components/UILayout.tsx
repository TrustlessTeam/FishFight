
// React
import {
  Link,
	Outlet
} from "react-router-dom";

// React web3
import { useWeb3React } from '@web3-react/core';

// React toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled, { ThemeProvider } from 'styled-components';
import { BaseTheme } from '../default-theme';

// Components
import Nav from './Nav';
import Account from './Account';
import Balance from './Balance';

import logo from '../src/img/FishFightLogo.png'
import Blockchain from './BlockchainStatus';


import SeasonStatus from './SeasonStatus';
import UnityWindow from "./UnityWindow";



const UILayout = () => {
	const { account } = useWeb3React();
	
	return (
		<Wrapper>
			<Container>
				<Topbar>

					<SeasonStatus></SeasonStatus>
			
					<Nav></Nav>

					<AccountContainer>
						{account &&
							<Balance />
						}
						<Account/>
					</AccountContainer>
					
				</Topbar>
				

				<Outlet />


				<Blockchain></Blockchain>

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

const Wrapper = styled.div`
	display: flex;
	flex-flow: row wrap;
	width: 100vw;
	max-height: 100vh;
	/* background-color: darkblue; */
	background-image: none;
	font-size: 1rem;
`;

const Container = styled.div`
	display: flex;
	width: 100vw;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	height: 100vh;
	margin: 0 auto;
`;

const Topbar = styled.div`
	position: absolute;
	top: 0;
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-evenly;
	align-items: center;
	/* margin: ${props => props.theme.spacing.gap}; */
	margin-top: 4px;
	width: 98%;
	height: 8%;
	z-index: 5;
	pointer-events: auto;
`;

const AccountContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-evenly;
	width: 30%;
`;


export default UILayout;
