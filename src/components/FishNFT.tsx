import styled from "styled-components";
import { Fish } from "../utils/fish";
import defaultImage from "../img/default.png";
import { useState } from "react";
import breedingImg from "../img/icons/breeding-dark.svg";
import fightingImg from "../img/icons/fighting-dark.svg";
import fishImg from "../img/icons/fish-dark.svg";
import alphaImg from "../img/icons/alpha-dark.svg";
import bettaImg from "../img/icons/betta-dark.svg";
import scaleImg from "../img/icons/FishScale.png";
import bloaterImg from "../img/icons/dfk-bloater.png";
import strImg from "../img/icons/str.png";
import intImg from "../img/icons/int.png";
import agiImg from "../img/icons/agi.png";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import BaseButton from "../components/BaseButton";
import { useFishFight } from "../context/fishFightContext";
import web3 from 'web3';
import { PoolFish, PoolTypes } from "../context/fishPoolContext";

import { BaseText, ContainerColumn, ContainerRow, StyledModal, Title } from "./BaseStyles";


type Props = {
  fish: Fish;
  itemId: string;
  onClick?: () => void;
  selectedUser?: boolean;
  selectedOpponent?: boolean;
  depositFighter?: boolean;
  depositAlpha?: boolean;
  type?: string;
  fishPool?: PoolFish;
  poolType?: PoolTypes;
  buffModal?: () => void;
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
  fishPool,
  poolType,
  buffModal
}: Props) => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
  const { FishFight } = useFishFight();

  const {
    depositBreedingFish,
    withdrawBreedingFish,
    depositFightingFish,
    depositFightingFishWeak,
    depositFightingFishNonLethal,
    withdrawFightingFish,
    withdrawFightingFishWeak,
    withdrawFightingFishNonLethal,
    feedFish,
    questFish,
    claimFishFood,
    contractApproveERC20Modifiers,
    contractModifierDFK,
    contractModifierFishProducts,
    smartWithdraw
  } = useContractWrapper();

	const closeModal = () => {
		setModalIsOpen(false);
	};

  return (
    <FishContainer
    tabIndex={0}
    role="bottom"
    >
      <StyledModal
        isOpen={modalIsOpen}
        overlayClassName="Overlay"
        onRequestClose={closeModal}
        shouldCloseOnOverlayClick
      >
        <ContainerWrapper> 
          <Title>{`Core Fight Buffs`}</Title>
          <BaseText>{`Consume ${Constants._fightModifierCost} of your Fish's Power to increase an attribute of your $FISH for 3 Fights!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              <LogoImg src={strImg}></LogoImg>
              <BaseText>{`Strength ${fish.strength} -> ${fish.strength+Constants._fightModifierValue > 100 ? 100 : fish.strength+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_STR); closeModal()}}>Buff Strength</BaseButton>
            </ContainerColumnSmall>
            <ContainerColumnSmall>
              <LogoImg src={intImg}></LogoImg>
              <BaseText>{`Intelligence ${fish.intelligence} -> ${fish.intelligence+Constants._fightModifierValue > 100 ? 100 : fish.intelligence+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_INT); closeModal()}}>Buff Intelligence</BaseButton>
            </ContainerColumnSmall>
            <ContainerColumnSmall>
              <LogoImg src={agiImg}></LogoImg>
              <BaseText>{`Agility ${fish.agility} -> ${fish.agility+Constants._fightModifierValue > 100 ? 100 : fish.agility+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_AGI); closeModal()}}>Buff Agility</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
          <Title>{`Token Modifiers`}</Title>
          <BaseText>{`A variety of modifiers to buff your $FISH based on the token used!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              <LogoImg src={scaleImg}></LogoImg>
              <Text>{`${web3.utils.fromWei(Constants._scaleFee)} $FISHSCALE`}</Text>
              <SubText>Prevent Power Loss<br></br>Lasts: 1 Fight</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.fishScale, Constants._scaleFee, () => contractModifierFishProducts(fish, 1)); closeModal()}}>Consume</BaseButton>
            </ContainerColumnSmall>

            <ContainerColumnSmall>
              <LogoImg src={bloaterImg}></LogoImg>
              <Text>{`${Constants._bloaterCost} $BLOATER`}</Text>
              <SubText>+2 Str : -2 Int<br></br>Lasts: 5 Fights</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.bloater, Constants._bloaterCost.toString(), () => contractModifierDFK(fish, 1)); closeModal()}}>Consume</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
        </ContainerWrapper>

      </StyledModal>
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
          onClick={() => {if(onClick) onClick();}}
          src={fish.imgSrc}
          draggable="false"
        ></FishImg>
      ) : (
        <FishImg
          selectedOpponent={selectedOpponent}
          selectedUser={selectedUser}
          onClick={() => {if(onClick) onClick();}}
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
          {!fish.stakedBreeding && !fish.stakedFighting && buffModal !== undefined &&
            <FishButton onClick={() => buffModal()}>Buff</FishButton>
          }
          {fish.stakedFighting && poolType === PoolTypes.Ocean && (
            <FishButton onClick={() => smartWithdraw(fish)}>Withdraw</FishButton>
          )}
          {fish.stakedFighting && poolType === PoolTypes.Fighting && (
            <FishButton onClick={() => withdrawFightingFish(fish)}>Withdraw</FishButton>
          )}
          {fish.stakedFighting && poolType === PoolTypes.FightingWeak && (
            <FishButton onClick={() => withdrawFightingFishWeak(fish)}>Withdraw</FishButton>
          )}
          {fish.stakedFighting && poolType === PoolTypes.FightingNonLethal && (
            <FishButton onClick={() => withdrawFightingFishNonLethal(fish)}>Withdraw</FishButton>
          )}
					{fish.stakedBreeding && (
            <FishButton onClick={() => withdrawBreedingFish(fish)}>Withdraw</FishButton>
          )}
          {!fish.stakedFighting && !fish.stakedBreeding && poolType === PoolTypes.Fighting && (
            <FishButton onClick={() => depositFightingFish(fish)}>Deposit</FishButton>
          )}
          {!fish.stakedFighting && !fish.stakedBreeding && poolType === PoolTypes.FightingWeak && (
            <FishButton onClick={() => depositFightingFishWeak(fish)}>Deposit</FishButton>
          )}
          {!fish.stakedFighting && !fish.stakedBreeding && poolType === PoolTypes.FightingNonLethal && (
            <FishButton onClick={() => depositFightingFishNonLethal(fish)}>Deposit</FishButton>
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
    </FishContainer>
  );
};

const ContainerWrapper = styled(ContainerColumn)`
  justify-content: center;
  align-items: center;
`;

const ContainerColumnSmall = styled(ContainerColumn)`
  justify-content: flex-start;
  align-items: center;
	padding: ${props => props.theme.spacing.gapSmall};
  min-width: 25%;
  max-width: 50%;
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

const Text = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
  align-items: center;
  text-align: center;
	margin: 0;
	color: #61daff;

	font-size: ${props => props.theme.font.small};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.medium};
  }
`;

const SubText = styled.p`
	display: flex;
	flex-flow: column;
	justify-content: center;
  align-items: center;
  text-align: center;
	margin: 0;
	color: white;
  padding: 3px;

	font-size: ${props => props.theme.font.xsmall};

	@media ${props => props.theme.device.tablet} {
		font-size: ${props => props.theme.font.small};
  }
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

const LogoImg = styled.img`
  height: 30px;

  @media ${props => props.theme.device.tablet} {
		height: 40px;
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
  width: 100px;
  border-radius: 50%;
  cursor: pointer;

  ${({ selectedUser }) =>
    selectedUser &&
    `
    // border-color: rgba(0, 128, 0, 0.5);
		height: 120px;
    width: 120px;
  `}
  ${({ selectedOpponent }) =>
    selectedOpponent &&
    `
    // border-color: rgba(154, 3, 30, 0.5);
		height: 120px;
    width: 120px;
  `}

  @media ${props => props.theme.device.tablet} {
		height: 120px;
    width: 120px;
    ${({ selectedUser }) =>
    selectedUser &&
    `
    // border-color: rgba(0, 128, 0, 0.5);
		height: 150px;
    width: 150px;

  `}
  ${({ selectedOpponent }) =>
    selectedOpponent &&
    `
		height: 150px;
    width: 150px;
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
`;


export default FishNFT;
