import { useWeb3React } from '@web3-react/core';

import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled from 'styled-components';


// Components
import Nav from './Nav';
import Account from './Account';
import { useState } from "react";
import StatusModal from "./StatusModal";
import BaseButton from "../components/BaseButton";
import useSound from 'use-sound';

import muteImg from "../img/icons/mute-dark.svg";
import noMuteImg from "../img/icons/nomute-dark.svg";

const MenuOverlay = () => {
	const { account } = useWeb3React();
	const [open, setOpen] = useState(false);
	const [muted, setMuted] = useState(true);
	const [play, { pause } ] = useSound('in_deep_90s.mp3', {loop: true, volume: 0.25});

	const handleSoundClick = () => {
		console.log(muted)
		if(muted) {
			play();
			setMuted(false);
		}
		else {
			pause();
			setMuted(true);
		}
		
	}
	
	return (
		<Wrapper open={open}>
			<MenuContainer>
				
				<StatusModal>
					<SoundButton onClick={() => handleSoundClick()}><LogoImg src={muted ? muteImg : noMuteImg}></LogoImg></SoundButton>
				</StatusModal>
				
				<StyledNav></StyledNav>
				<User open={open}>
					<Account mobile={false}></Account>
					{/* <Balance></Balance> */}
				</User>
				<Account mobile={true}></Account>
				
				
				
				{/* <InfoContainer open={open}>
					
				</InfoContainer> */}
			</MenuContainer>
		</Wrapper>
	);
};

interface Props {
	open?: boolean;
}

const SoundButton = styled(BaseButton)`
	padding: 5px;
	border-radius: 50%;

	&::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 50%;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

	@media ${props => props.theme.device.tablet} {
	  padding: 10px;
  }
`;


const LogoImg = styled.img`
	/* padding: ${props => props.theme.spacing.gapSmall}; */
	height: 15px;

	@media ${props => props.theme.device.tablet} {
	  height: 20px;
  }
`;

const Wrapper = styled.div<{open: boolean}>`
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 5;
	pointer-events: auto;
	background-color: ${p => (p.open ? "rgba(0, 0, 0, 0.6)" : "none")};

	@media ${props => props.theme.device.tablet} {
		background-color: none;
  }
`;

const MenuContainer = styled.div`
	display: flex;
	padding: ${props => props.theme.spacing.gapSmall};
	/* flex-flow: column; */
	justify-content: center;
	flex-flow: row nowrap;
	align-items: center;
	/* justify-content: space-between; */
	background-color: rgba(0, 0, 0, 0.6);

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: space-between;
		/* width: 100%; */
  }
`;

const User = styled.div<{open: boolean}>`
	display: none;
	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-end;
		width: 40%;
  }
`;

const UserMobile = styled.div<{open: boolean}>`
	display: flex;
	@media ${props => props.theme.device.tablet} {
		
		display: none;
  }
`;

const StyledNav = styled(Nav)`
	width: 100%;
	/* order: 0;
	@media ${props => props.theme.device.tablet} {
		order: 1;
  } */
`;





export default MenuOverlay;
