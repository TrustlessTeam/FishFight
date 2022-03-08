import styled from "styled-components";
import { Fish } from "../utils/fish";
import defaultImage from "../img/default.png";
import { useState } from "react";

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
import BN from 'bn.js';
import { BaseButton } from "./BaseStyles";


type Props = {
  fish: Fish;
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
  onClick,
  selectedOpponent,
  selectedUser,
  type,
}: Props) => {
  const [showStats, setShowStats] = useState<boolean>(false);
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

  return (
    <FishContainer>
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
          onClick={onClick}
          src={fish.imgSrc}
        ></FishImg>
      ) : (
        <FishImg
          selectedOpponent={selectedOpponent}
          selectedUser={selectedUser}
          onClick={onClick}
          src={defaultImage}
        ></FishImg>
      )}

      {selectedUser && (
        <Options>
          <FishButton onClick={() => feedFish(fish)}>Feed</FishButton>
          {fish.fishModifiers.canCollect() && !fish.stakedBreeding && !fish.stakedFighting &&
            <FishButton onClick={() => claimFishFood(fish)}>Collect</FishButton>
          }
          {fish.canQuest && !fish.stakedBreeding && !fish.stakedFighting &&
            <FishButton onClick={() => questFish(fish)}>Quest</FishButton>
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
  border-radius: 20px;

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
