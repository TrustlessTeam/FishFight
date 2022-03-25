import { useEffect } from 'react';
import styled from 'styled-components';
import { useUnity } from '../context/unityContext';
import Account from './Account';

type Props = {
  text: string
};

const ConnectWallet = ({ text }: Props) => {

	return (
		<ConnectContainer>
			<Account textOverride={"Connect"}/>
			<Text>{text}</Text>
		</ConnectContainer>
	);
};

const ConnectContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
`;

const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
	padding: ${props => props.theme.spacing.gap};
	margin: 0;
	margin-top: ${props => props.theme.spacing.gap};
	background-color: white;
	font-size: ${props => props.theme.font.large};
	border-radius: 25px;
	margin-left: ${props => props.theme.spacing.gapSmall};
`;


export default ConnectWallet;
