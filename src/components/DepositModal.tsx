import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";

import BaseButton from "./BaseButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import { useFishFight } from "../context/fishFightContext";
import Fish from "../utils/fish";

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

const DepositModal = ({
  fish,
  modalIsOpen,
  toggleModal
}: Props) => {

  const { account } = useWeb3React();
  const { currentPhase, fightingWatersSupply, fightingWatersWeakSupply, fightingWatersNonLethalSupply } = useFishFight();

  const {
    depositFightingFish,
    depositFightingFishWeak,
    depositFightingFishNonLethal,
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
          <Title>{`Death-Fighting Pools`}</Title>
          <BaseText>{`A Fight to the Death! Pick the Fight Pool best suited for your Fish!`}</BaseText>
          <ContainerRow>
            <ContainerColumnSmall>
              <Text>{`FREE FOR ALL`}</Text>
              <SubText>Any Fish is allowed.</SubText>
              <SubText>Loser Burned. Winner becomes Alpha.</SubText>
              <SubText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase?.phase === 2 ? Constants._fishFoodPerWinInPhase : Constants._fishFoodPerWin)}`}</SubText>
              <SubText>{`$FISHFOOD per Hour: ~${web3.utils.fromWei(Constants._fishFoodPerBlockBN.mul(1800).div(fightingWatersSupply+1).toString())}`}</SubText>
              <BaseButton onClick={() => {depositFightingFish(fish); toggleModal()}}>Deposit</BaseButton>
            </ContainerColumnSmall>

            <ContainerColumnSmall>
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
          <ContainerRow>
            <ContainerColumnSmall>
              <Text>{`FREE FOR ALL`}</Text>
              <SubText>Any Fish is allowed.</SubText>
              <SubText>Loser Removed from Pool. Winner earns FishFood.</SubText>
              <SubText>{`$FISHFOOD per Win: ${web3.utils.fromWei(currentPhase?.phase === 2 ? Constants._fishFoodPerWinInPhaseNonLethal : Constants._fishFoodPerWinNonLethal)}`}</SubText>
              <SubText>{`$FISHFOOD per Hour: ~${web3.utils.fromWei(Constants._fishFoodPerBlockNonLethalBN.mul(1800).div(fightingWatersNonLethalSupply+1).toString())}`}</SubText>
              <BaseButton onClick={() => {depositFightingFishNonLethal(fish); toggleModal()}}>Deposit</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
        </ContainerWrapper>

      </StyledModal>
  );
};

export default DepositModal;

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
