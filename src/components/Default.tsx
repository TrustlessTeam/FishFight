// React
import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect } from 'react';
// Styled Components
import styled from 'styled-components';
import { useUnity } from '../context/unityContext';
import { BaseText, UIContainer } from './BaseStyles';



const Default = () => {
	const unityContext = useUnity();
	const { account } = useWeb3React();


	useEffect(() => {
		unityContext.showHome();
	}, []);

	return (
			<WelcomeContainer>
				<UIContainer>
					<h1>Welcome to FishFight!</h1>
				{/* {!account &&
					<BaseText>
						Connect your Wallet to get
					</BaseText>
				} */}
				</UIContainer>

			</WelcomeContainer>
	);
};

const WelcomeContainer = styled.div`
	display: flex;
	flex-flow: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;




export default Default;
