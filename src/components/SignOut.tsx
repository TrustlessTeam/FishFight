import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import BaseButton from "../components/BaseButton";
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

const SignOutBtn = styled(BaseButton)`
	margin-left: ${props => props.theme.spacing.gap};
`;

export default SignOut;
