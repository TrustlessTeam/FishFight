import React, { useState } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";

import scaleImg from "../img/icons/FishScale.png";
import bloaterImg from "../img/icons/dfk-bloater.png";
import strImg from "../img/icons/str.png";
import intImg from "../img/icons/int.png";
import agiImg from "../img/icons/agi.png";

import {
  BaseContainer,
  BaseText,
  ContainerColumn,
  ContainerControls,
  ContainerRow,
  StyledModal,
  Title,
} from "./BaseStyles";
import BaseButton from "./BaseButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import { useFishFight } from "../context/fishFightContext";
import Fish from "../utils/fish";

type Props = {
  fish: Fish;
  modalIsOpen: boolean;
  toggleModal: () => void;
};

const BuffModal = ({
  fish,
  modalIsOpen,
  toggleModal
}: Props) => {

  const { account } = useWeb3React();
  const { FishFight } = useFishFight();

  const {
    depositBreedingFish,
    withdrawBreedingFish,
    depositFightingFish,
    depositFightingFishWeak,
    withdrawFightingFish,
    withdrawFightingFishWeak,
    feedFish,
    questFish,
    claimFishFood,
    contractApproveERC20Modifiers,
    contractModifierDFK,
    contractModifierFishProducts,
    smartWithdraw
  } = useContractWrapper();

  // console.log(showFightingDisclaimer)
  
	// const closeModal = () => {
	// 	setModalIsOpen(false);
	// };

  if (!account) return null;

  return (
    <StyledModal
        isOpen={modalIsOpen}
        // className="Modal"
        overlayClassName="Overlay"
        onRequestClose={toggleModal}
        shouldCloseOnOverlayClick
      >
        {/* {active ? <SignOut account={parsedAccount} closeModal={closeModal} /> : <Wallets closeModal={closeModal} />} */}
        <ContainerWrapper> 
          <Title>{`Core Fight Buffs`}</Title>
          <BaseText>{`Consume ${Constants._fightModifierCost} of your Fish's Power to increase an attribute of your $FISH for 3 Fights!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              <LogoImg src={strImg}></LogoImg>
              <BaseText>{`Strength ${fish.strength} -> ${fish.strength+Constants._fightModifierValue > 100 ? 100 : fish.strength+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_STR); toggleModal()}}>Buff Strength</BaseButton>
            </ContainerColumnSmall>
            <ContainerColumnSmall>
              <LogoImg src={intImg}></LogoImg>
              <BaseText>{`Intelligence ${fish.intelligence} -> ${fish.intelligence+Constants._fightModifierValue > 100 ? 100 : fish.intelligence+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_INT); toggleModal()}}>Buff Intelligence</BaseButton>
            </ContainerColumnSmall>
            <ContainerColumnSmall>
              <LogoImg src={agiImg}></LogoImg>
              <BaseText>{`Agility ${fish.agility} -> ${fish.agility+Constants._fightModifierValue > 100 ? 100 : fish.agility+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_AGI); toggleModal()}}>Buff Agility</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
          <Title>{`Token Modifiers`}</Title>
          <BaseText>{`A variety of modifiers to buff your $FISH based on the token used!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              <LogoImg src={scaleImg}></LogoImg>
              <Text>{`${web3.utils.fromWei(Constants._scaleFee)} $FISHSCALE`}</Text>
              <SubText>Prevent Power Loss<br></br>Lasts: 1 Fight</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.fishScale, Constants._scaleFee, () => contractModifierFishProducts(fish, 1)); toggleModal()}}>Consume</BaseButton>
            </ContainerColumnSmall>

            <ContainerColumnSmall>
              <LogoImg src={bloaterImg}></LogoImg>
              <Text>{`${Constants._bloaterCost} $BLOATER`}</Text>
              <SubText>+2 Str : -2 Int<br></br>Lasts: 5 Fights</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.bloater, Constants._bloaterCost.toString(), () => contractModifierDFK(fish, 1)); toggleModal()}}>Consume</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
        </ContainerWrapper>

      </StyledModal>
  );
};

export default BuffModal;

// const Text = styled.p`
//   color: white;
//   margin: 0;
//   font-weight: bold;
//   padding-bottom: ${(props) => props.theme.spacing.gap};

//   span {
//     color: red;
//   }
// `;

export const ContainerText = styled.div`
  padding-top: ${(props) => props.theme.spacing.gapSmall};
`;

export const ApprovalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: ${(props) => props.theme.spacing.gap};
`;

export const ApprovalDisclaimer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.gap};
  border-radius: 25px;
	z-index: 10;
`;

export const OptionsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
`;



const ContainerWrapper = styled(ContainerColumn)`
  justify-content: <center></center>;
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

export const Text = styled.p`
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

export const SubText = styled.p`
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

const LogoImg = styled.img`
  height: 30px;

  /* background: linear-gradient(#caf0f8, #48cae4);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3); */

  @media ${props => props.theme.device.tablet} {
		height: 40px;
  }
`;