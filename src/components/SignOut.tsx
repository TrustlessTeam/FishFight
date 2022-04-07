import React from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import BaseButton from "../components/BaseButton";
import { Title } from './BaseStyles';
import { useFishFight } from "../context/fishFightContext";

export interface Props {
	account: string | null | undefined;
	closeModal: () => void;
}

const SignOut = ({ account, closeModal }: Props) => {
	const { deactivate } = useWeb3React();
	const {setLogOut} = useFishFight();

	const handleClick = () => {
		setLogOut(true);
		deactivate();
		closeModal();
	};

	return (
		<SignOutBtn onClick={handleClick}>Disconnect</SignOutBtn>
	);
};

const SignOutComponent = styled.div`
	display: flex;
	align-items: center;
	padding: ${props => props.theme.spacing.gap};
	/* justify-content: space-around; */
	flex-direction: row;
	overflow: hidden;
	z-index: 20;

	/* & p {
		margin: 0;
		font-size: 1.5rem;
	} */

	& span {
		font-size: ${props => props.theme.font.medium}
	}
`;

const SignOutBtn = styled(BaseButton)`
	margin-left: ${props => props.theme.spacing.gap};
`;

export default SignOut;
