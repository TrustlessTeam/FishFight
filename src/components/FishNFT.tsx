import styled from "styled-components";
import { Fish } from "../utils/fish";
import defaultImage from "../img/default.png";
import { useContext, useState } from "react";
import Modal from 'react-modal';

import fishingImg from "../img/icons/fishing.svg";
import breedingImg from "../img/icons/breeding-dark.svg";
import fightingImg from "../img/icons/fighting-dark.svg";
import oceanImg from "../img/icons/ocean.svg";
import fishImg from "../img/icons/fish-dark.svg";
import alphaImg from "../img/icons/alpha-dark.svg";
import bettaImg from "../img/icons/betta-dark.svg";
import { useContractWrapper } from "../context/contractWrapperContext";
import { useFishFight } from "../context/fishFightContext";
import { Constants } from "../utils/constants";
import BaseButton from "../components/BaseButton";
import { BaseText, BaseTitle, StyledModal } from "./BaseStyles";
import { VisibilityContext } from "react-horizontal-scrolling-menu";
import useSound from 'use-sound';


import iceImg from "../img/ice.jpg";
import bloodImg from "../img/blood.png";


type Props = {
  fish: Fish;
  itemId: string;
  onClick?: () => void;
  selectedUser?: boolean;
  selectedOpponent?: boolean;
  depositFighter?: boolean;
  depositAlpha?: boolean;
  type?: string;
};

interface ImgProps {
  selectedOpponent?: boolean;
  selectedUser?: boolean;
}

const FishNFT = ({
  fish,
  itemId,
  onClick,
  selectedOpponent,
  selectedUser,
  type,
}: Props) => {
  const [showStats, setShowStats] = useState<boolean>(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);

  const [playSplash] = useSound('splash.ogg', {volume: 0.25});
  const [playSplash2] = useSound('splash2.ogg', {volume: 0.25});

	// const handleSoundClick = () => {
	// 	if(muted) {
	// 		play();
	// 	}
	// 	else {
	// 		pause();
	// 	}
	// 	setMuted(!muted)
	// }

  const {
    depositBreedingFish,
    withdrawBreedingFish,
    depositFightingFish,
    withdrawFightingFish,
    feedFish,
    questFish,
    claimFishFood,
    pendingTransaction,
  } = useContractWrapper();

  const toggleStats = () => {
    setShowStats((prevShowStats) => !prevShowStats);
  };

  const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};

  const visibility = useContext(VisibilityContext);

  const visible = visibility.isItemVisible(itemId);

  const playSound = () => {
    const rand = Math.floor(Math.random() * 2) + 1
    if(rand === 1) {
      playSplash();
    } else {
      playSplash2();
    }
  }

  return (
    <FishContainer
    tabIndex={0}
    role="bottom"
    >
      <StyledModal
        isOpen={modalIsOpen}
        // className="Modal"
        overlayClassName="Overlay"
        onRequestClose={closeModal}
        shouldCloseOnOverlayClick
      >
        {/* {active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />} */}
        <ModalWrapper>
          <BaseTitle>{`Drain ${Constants._fightModifierCost} Power to Buff an attribute of your $FISH for 3 Fights!`}</BaseTitle>
          <ModalContainer>
            <ModalItem>
              <BaseText>{`Strength ${fish.strength} -> ${fish.strength+Constants._fightModifierValue > 100 ? 100 : fish.strength+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, 0); closeModal()}}>Buff Strength</BaseButton>
            </ModalItem>
            <ModalItem>
              <BaseText>{`Intelligence ${fish.intelligence} -> ${fish.intelligence+Constants._fightModifierValue > 100 ? 100 : fish.intelligence+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_INT); closeModal()}}>Buff Intelligence</BaseButton>
            </ModalItem>
            <ModalItem>
              <BaseText>{`Strength ${fish.agility} -> ${fish.agility+Constants._fightModifierValue > 100 ? 100 : fish.agility+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_AGI); closeModal()}}>Buff Agility</BaseButton>
            </ModalItem>          
          </ModalContainer>
        </ModalWrapper>
        
      </StyledModal>
      {/* <ToggleButton onClick={() => toggleStats()}>info</ToggleButton> */}
      <FishStats>
        <FishId>{fish.tokenId}</FishId>
        {!fish.stakedFighting && !fish.stakedBreeding && (
          <LogoSmallImg src={fishImg} alt="$FISH"></LogoSmallImg>
        )}
        {fish.stakedFighting && (
          <LogoSmallImg src={fightingImg} alt="$FIGHTFISH"></LogoSmallImg>
        )}
				{fish.stakedBreeding && (
          <LogoSmallImg src={breedingImg} alt="$FIGHTFISH"></LogoSmallImg>
        )}
        {type === 'Breeding' && fish.fishModifiers.alphaModifier.uses > 0 && (
          <LogoSmallImg src={alphaImg} alt="$FIGHTFISH"></LogoSmallImg>
        )}
				{type === 'Breeding' && fish.fishModifiers.alphaModifier.uses === 0 && (
          <LogoSmallImg src={bettaImg} alt="$FIGHTFISH"></LogoSmallImg>
        )}
      </FishStats>
      {fish.imgSrc ? (
        <FishImg
          selectedOpponent={selectedOpponent}
          selectedUser={selectedUser}
          onClick={() => {if(onClick) onClick(); playSound();}}
          src={fish.imgSrc}
          draggable="false"
        ></FishImg>
      ) : (
        <FishImg
          selectedOpponent={selectedOpponent}
          selectedUser={selectedUser}
          onClick={() => {if(onClick) onClick(); playSound();}}
          src={defaultImage}
          draggable="false"
        ></FishImg>
      )}

      {selectedUser && (
        <Options>
          <FishButton onClick={() => feedFish(fish)}>Feed</FishButton>
          {fish.fishModifiers.canCollect() && !fish.stakedBreeding && !fish.stakedFighting &&
            <FishButton onClick={() => claimFishFood(fish)}>Collect</FishButton>
          }
          {fish.canQuest && !fish.stakedBreeding && !fish.stakedFighting &&
            <FishButton onClick={() => toggleModel()}>Buff</FishButton>
          }
          {fish.stakedFighting && (
            <FishButton onClick={() => withdrawFightingFish(fish)}>Withdraw</FishButton>
          )}
					{fish.stakedBreeding && (
            <FishButton onClick={() => withdrawBreedingFish(fish)}>Withdraw</FishButton>
          )}
          {!fish.stakedFighting && !fish.stakedBreeding && type === 'Fighting' && (
            <FishButton onClick={() => depositFightingFish(fish)}>Deposit</FishButton>
          )}
          {!fish.stakedFighting &&
            !fish.stakedBreeding &&
            type === 'Breeding' &&
            fish.fishModifiers.alphaModifier.uses > 0 && (
              <FishButton onClick={() => depositBreedingFish(fish)}>Deposit</FishButton>
            )}
        </Options>
      )}

      {selectedOpponent &&
        <Options>
          <FishButton onClick={() => feedFish(fish)}>Feed</FishButton>
        </Options>
      }

      {/* {showStats &&
				<FishStatsOverlay>
					<FishData>Str:{fish.strength}</FishData>
					<FishData>Int:{fish.intelligence}</FishData>
					<FishData>Agi:{fish.agility}</FishData>
					<FishData>Wins: {fish.lifetimeWins}</FishData>
					{fish.ipfsLink &&
					<FishData><a target="_blank" href={fish.ipfsLink}>IPFS</a></FishData>
					}
				</FishStatsOverlay>
			} */}
    </FishContainer>
  );
};

const ModalContainer = styled.div`
	position: relative;
	display: flex;
	flex-flow: row nowrap;
	padding: ${props => props.theme.spacing.gap};
	/* justify-content: space-evenly;
	align-items: flex-start; */
`;

const ModalItem = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	padding: ${props => props.theme.spacing.gapSmall};
	/* justify-content: space-evenly;
	align-items: flex-start; */
`;

const ModalWrapper = styled.div`
	position: relative;
	display: flex;
	flex-flow: column;
	/* background-color: white; */
  /* background: url(${bloodImg}), url(${iceImg});
  background-blend-mode: darken;
  border: solid white 2px;
  border-radius: 20px; */
	padding: ${props => props.theme.spacing.gap};
	/* justify-content: space-evenly;
	align-items: flex-start; */
`;


const Options = styled.div`
  position: absolute;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  bottom: 0;
`;

const FishButton = styled(BaseButton)`
  padding: 10px;
  margin: 0 2px;
  border-radius: 20px !important;

  @media ${props => props.theme.device.tablet} {
    font-size: 14px;
  }
  &::before {
    border-radius: 20px;
  }
  &:active {
		transform: scale(0.8);
	}
`;

const LogoImg = styled.img`
  width: 50px;
  background-color: white;
  border-radius: 50%;
  padding: 3px;
`;
const LogoSmallImg = styled.img`
  height: 20px;
  /* background-color: white; */
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(#caf0f8, #48cae4);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);

  @media ${props => props.theme.device.tablet} {
		height: 25px;
  }
`;

const FishContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  margin: 0 ${(props) => props.theme.spacing.gapSmall};
`;

const FishImg = styled.img<ImgProps>`
  height: 100px;
  border-radius: 50%;
  /* border-radius: 40px; */
  /* border: 0.5vh solid rgba(255, 255, 255, 0.5); */
  cursor: pointer;
  ${({ selectedUser }) =>
    selectedUser &&
    `
    // border-color: rgba(0, 128, 0, 0.5);
		height: 120px;
  `}
  ${({ selectedOpponent }) =>
    selectedOpponent &&
    `
    // border-color: rgba(154, 3, 30, 0.5);
		height: 120px;
  `}

  @media ${props => props.theme.device.tablet} {
		height: 120px;
    ${({ selectedUser }) =>
    selectedUser &&
    `
    // border-color: rgba(0, 128, 0, 0.5);
		height: 150px;
  `}
  ${({ selectedOpponent }) =>
    selectedOpponent &&
    `
    // border-color: rgba(154, 3, 30, 0.5);
		height: 150px;
  `}
  }

  
`;

const FishId = styled.p`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding: 3px 10px;
  margin: 0;
  /* background-color: white; */
  /* opacity: 0.6; */
  color: black;
  font-size: ${(props) => props.theme.font.small};
  font-weight: bold;
  border-radius: 20px;
  pointer-events: none;
  background: linear-gradient(#caf0f8, #48cae4);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3);

  @media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;

const FishStats = styled.div`
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  width: 100%;
  top: 0;
  pointer-events: none;
  /* padding: ${(props) => props.theme.spacing.gapSmall}; */
`;

const FishStatsOverlay = styled.div`
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-start;
  height: 17vh;
  top: 50;
  bottom: 50;
  border-radius: 25px;
`;

const FishData = styled.p`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  color: ${"black"};
  text-align: center;
  font-size: ${(props) => props.theme.font.medium};
  font-weight: bold;
  background-color: white;
  margin: 0 ${(props) => props.theme.spacing.gapSmall};
  padding: ${(props) => props.theme.spacing.gapSmall};
  border-radius: 50%;
  height: ${(props) => props.theme.font.small}vmin;
`;

export default FishNFT;
