import React from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { BaseButton } from './BaseStyles';

export interface Props {
	account: string | null | undefined;
	closeModal: () => void;
}

const SignOut = ({ account, closeModal }: Props) => {
	const { deactivate } = useWeb3React();

	const handleClick = () => {
		deactivate();
		closeModal();
	};

	return (
		<SignOutComponent>
			<span>{account}</span>
			<BaseButton onClick={handleClick}>Sign out</BaseButton>
		</SignOutComponent>
	);
};

const SignOutComponent = styled.div`
	display: flex;
	align-items: center;
	padding: 20px 40px;
	/* justify-content: space-around; */
	flex-direction: column;
	overflow: hidden;
	z-index: 20;

	& p {
		margin: 0;
		font-size: 1.5rem;
	}

	& span {
		font-size: ${props => props.theme.font.medium}
		font-weight: bold;
		color: black;
		text-shadow: 0px 0px 10px white;
		padding: 5px;
	}
`;

const SignOutBtn = styled.div`
	margin-top: 20px;
	padding: ${props => props.theme.spacing.gap} ${props => props.theme.spacing.gap};
	border-radius: 10px;
	background-color: rgb(182, 35, 35);
	color: white;
	cursor: pointer;
`;

export default SignOut;
