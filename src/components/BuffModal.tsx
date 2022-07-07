import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";

import BaseButton from "./BaseButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import { useFishFight } from "../context/fishFightContext";
import Fish from "../utils/fish";

import scaleImg from "../img/icons/FishScale.png";
import bloaterImg from "../img/icons/dfk-bloater.png";
import strImg from "../img/icons/str.png";
import intImg from "../img/icons/int.png";
import agiImg from "../img/icons/agi.png";

import {
  BaseText,
  ContainerColumn,
  ContainerRow,
  StyledModal,
  Title,
} from "./BaseStyles";

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
    questFish,
    contractApproveERC20Modifiers,
    contractModifierDFK,
    contractModifierFishProducts,
  } = useContractWrapper();

  if (!account) return null;

  return (
    <StyledModal
        isOpen={modalIsOpen}
        overlayClassName="Overlay"
        onRequestClose={toggleModal}
        shouldCloseOnOverlayClick
      >
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

const LogoImg = styled.img`
  height: 30px;

  @media ${props => props.theme.device.tablet} {
		height: 40px;
  }
`;