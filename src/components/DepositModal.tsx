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

const DepositModal = ({
  fish,
  modalIsOpen,
  toggleModal
}: Props) => {

  const { account } = useWeb3React();
  const { currentPhase, fightingWatersSupply, fightingWatersWeakSupply } = useFishFight();

  const {
    depositFightingFish,
    depositFightingFishWeak,
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
          <Title>{`Death-Fighting Pools`}</Title>
          <BaseText>{`A Fight to the Death! Pick the Fight Pool best suited for your Fish!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              {/* <LogoImg src={scaleImg}></LogoImg> */}
              <Text>{`FREE FOR ALL`}</Text>
              <SubText>Any Fish is allowed.</SubText>
              <SubText>Loser Burned. Winner becomes Alpha.</SubText>
              <SubText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase?.phase === 2 ? Constants._fishFoodPerWinInPhase : Constants._fishFoodPerWin)}`}</SubText>
              <SubText>{`$FISHFOOD per Hour: ~${web3.utils.fromWei(Constants._fishFoodPerBlockBN.mul(1800).div(fightingWatersSupply+1).toString())}`}</SubText>
              <BaseButton onClick={() => {depositFightingFish(fish); toggleModal()}}>Deposit</BaseButton>
            </ContainerColumnSmall>

            <ContainerColumnSmall>
              {/* <LogoImg src={bloaterImg}></LogoImg> */}
              <Text>{`STATS UNDER 50`}</Text>
              <SubText>Fish with ALL Stats 50 or less.</SubText>
              <SubText>Loser Burned. Winner becomes Alpha.</SubText>
              <SubText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase?.phase === 2 ? Constants._fishFoodPerWinInPhaseWeak : Constants._fishFoodPerWinWeak)}`}</SubText>
              <SubText>{`$FISHFOOD per Hour: ~${web3.utils.fromWei(Constants._fishFoodPerBlockWeakBN.mul(1800).div(fightingWatersWeakSupply+1).toString())}`}</SubText>
              <BaseButton onClick={() => {depositFightingFishWeak(fish); toggleModal()}}>Deposit</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
          <Title>{`FishFood-Fighting Pools`}</Title>
          <BaseText>{`Risk your FishFood, not your Fish! Coming Soon...`}</BaseText>
        </ContainerWrapper>

      </StyledModal>
  );
};

export default DepositModal;

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