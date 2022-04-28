import { useWeb3React } from '@web3-react/core';

import 'react-toastify/dist/ReactToastify.css';

// Styled Components
import styled from 'styled-components';

import { useFishFight } from "../context/fishFightContext";

import HowToPlayModal from "./HowToPlayModal";
import {
	useLocation
  } from "react-router-dom";
// Components
import Nav from './Nav';
import Account from './Account';
import { useState } from "react";
import StatusModal from "./StatusModal";
import BaseButton from "../components/BaseButton";
import useSound from 'use-sound';

import sushiImg from "../img/icons/sushi-logo.svg";
import dfkImg from "../img/icons/jewel-icon.png";
import nftkeyImg from "../img/icons/nftkey-logo-circle.svg";
import discordImg from "../img/icons/discord.svg"
import tofunftImg from "../img/icons/tofunft.svg"
import muteImg from "../img/icons/mute-dark.svg";
import musicImg from "../img/icons/music-notes.svg";
import noMuteImg from "../img/icons/nomute-dark.svg";
import refreshImg from "../img/icons/refresh.svg";

import { useFishPool } from '../context/fishPoolContext';
import { toast } from 'react-toastify';

const MenuOverlay = () => {
	const { account } = useWeb3React();
	const [open, setOpen] = useState(false);
	const [openStore, setOpenStore] = useState(true);
	//const [mutedMusic, setMutedMusic] = useState(true);
	const [muted, setMuted] = useState(true);
	const [playFight, { stop } ] = useSound('genesis_landing_the_sea_of_no_mercy.mp3', {loop: true, volume: 0.075 });
	const [play, { pause } ] = useSound('genesis_landing.mp3', {loop: true, volume: 0.075});
	const { musicMute, toggleMusicMute, globalMute, toggleGlobalMute, refetchBalance, refetchStats } = useFishFight();
	const { refreshLoadedFish } = useFishPool();
	const location = useLocation().pathname.split('/')[1];

	const HandleOpenStore = () => {
		setOpenStore(true);		
	}

	const handleMusicClick = () => {
		console.log(musicMute)
		toggleMusicMute();

		if(musicMute) {
			//playFight();
			if ( location === 'fighting')
			{
				stop();
				pause();
				playFight();
				toast.dark(`The Sea of No Mercy by LIXION`);
			}
			else
			{
				stop();
				pause();
				play();
				toast.dark(`Genesis Landing by LIXION`);
			}

		}
		else {
			if ( location === 'fighting')
			{
				stop();
			}
			else
			{
				pause();
			}			
			//pauseFight();
//			toast.dark(`Genesis Landing by LIXION`);
		}
		
	}
	
	const handleSoundClick = () => {
		console.log(globalMute)
		toggleGlobalMute();
		
		if(muted) {
			//play();
			// TODO Creat global value that all the SFX play functions check to make sure they should make noise right now.
			//setMuted(false);
		}
		else {
			//pause();
			//setMuted(true);

		}
		
	}
	
	return (
		<Wrapper open={open}>
								
			<HowToPlayModal />

			<RefreshButton onClick={() => {refreshLoadedFish(); refetchBalance(); refetchStats();}}>
				<LogoImg src={refreshImg}></LogoImg>
			</RefreshButton>

			<MenuContainer>
				
				<StatusModal>

				</StatusModal>
					
				<StyledNav>
				</StyledNav>
						 
				<User>
					<Account>
					</Account>
				</User>
						
				

					
				
				
				
				
				{/* <InfoContainer open={open}>
					
				</InfoContainer> */}
			</MenuContainer>
				
				
			<SoundButton onClick={() => HandleOpenStore()}><a href="https://discord.com/invite/23ArJsQKnT" target="_blank" rel=""><LogoImg src={discordImg }></LogoImg></a>
			</SoundButton>
			<SoundButton onClick={() => HandleOpenStore()}><a href="https://app.sushi.com/swap?inputCurrency=ONE&outputCurrency=0x81E9E682d2d7F016Ff7c3D17567Ee7511f29f653&chainId=1666600000" target="_blank" rel=""><LogoImg src={sushiImg }></LogoImg></a>
			</SoundButton>
			<SoundButton onClick={() => HandleOpenStore()}><a href="https://game.defikingdoms.com/#/marketplace?outputCurrency=0x81E9E682d2d7F016Ff7c3D17567Ee7511f29f653" target="_blank" rel=""><LogoImg src={dfkImg }></LogoImg></a>
			</SoundButton>
			<SoundButton onClick={() => HandleOpenStore()}><a href="https://nftkey.app/collections/fishfight/" target="_blank" rel=""><LogoImg src={nftkeyImg }></LogoImg></a>
			</SoundButton>
			<SoundButton onClick={() => HandleOpenStore()}><a href="https://tofunft.com/collection/fishfight/items" target="_blank" rel=""><LogoImg src={tofunftImg }></LogoImg></a>
			</SoundButton>
			<SoundButton onClick={() => handleMusicClick()}><LogoImg src={musicMute ? muteImg : musicImg }></LogoImg>
			</SoundButton>
			<SoundButton onClick={() => handleSoundClick()}><LogoImg src={globalMute ? muteImg : noMuteImg }></LogoImg>
			</SoundButton>
		</Wrapper>
	);
};

interface Props {
	open?: boolean;
}

const SoundButton = styled(BaseButton)`

	border-radius: 50%;

	padding: 10px 10px !important;

	&::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(#ffffff, #e2e2e2);
    z-index: -1;
    transition: opacity 0.25s ease-in-out;
    opacity: 0;
  }

	@media ${props => props.theme.device.tablet} {
	  padding: 5px;
  }
`;



const StoreLogoImg = styled.img`
	height: 25px;
	@media ${props => props.theme.device.tablet} {
		padding: 10px;
  }
`;
const LogoImg = styled.img`
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
	justify-content: space-between;
	background-color: rgba(0, 0, 0, 0.6);

	@media ${props => props.theme.device.tablet} {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		justify-content: space-between;
		/* width: 100%; */
  }
`;

const User = styled.div`
	display: flex;
	flex-flow: row wrap;
	justify-content: flex-end;
	width: 33%;
	max-width: 350px;

`;


const StyledNav = styled(Nav)`
	width: 33%;
	/* order: 0;
	@media ${props => props.theme.device.tablet} {
		order: 1;
  } */
`;

const RefreshButton = styled(BaseButton)`
  position: absolute;
  top: 100px;
  right: 0;
  padding: 10px 10px !important;
  border-radius: 50%;
  margin: ${(props) => props.theme.spacing.gap};
  font-weight: bolder;
  font-size: 25px;

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

  @media ${(props) => props.theme.device.tablet} {
    top: 150px;
  }
`;





export default MenuOverlay;
