import styled from "styled-components";
import { Fish } from "../utils/fish";
import defaultImage from "../img/default.png";
import { useContext, useState } from "react";
import breedingImg from "../img/icons/breeding-dark.svg";
import fightingImg from "../img/icons/fighting-dark.svg";
import fishImg from "../img/icons/fish-dark.svg";
import alphaImg from "../img/icons/alpha-dark.svg";
import bettaImg from "../img/icons/betta-dark.svg";
import scaleImg from "../img/icons/FishScale.png";
import eggImg from "../img/icons/FishEgg.png";
import strImg from "../img/icons/str.png";
import intImg from "../img/icons/int.png";
import agiImg from "../img/icons/agi.png";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import BaseButton from "../components/BaseButton";
import { BaseText, BaseTitle, ContainerColumn, ContainerRow, StyledModal, Title } from "./BaseStyles";
import { VisibilityContext } from "react-horizontal-scrolling-menu";
import { useFishFight } from "../context/fishFightContext";
import web3 from 'web3';


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

  const { FishFight } = useFishFight();

  const {
    depositBreedingFish,
    withdrawBreedingFish,
    depositFightingFish,
    withdrawFightingFish,
    feedFish,
    questFish,
    claimFishFood,
    contractApproveERC20Modifiers,
    contractModifierDFK,
    contractModifierFishProducts
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
              <BaseText>{`Strength ${fish.agility} -> ${fish.agility+Constants._fightModifierValue > 100 ? 100 : fish.agility+Constants._fightModifierValue}`}</BaseText>
              <BaseButton onClick={() => {questFish(fish, Constants.MODIFIER_AGI); closeModal()}}>Buff Agility</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
          <Title>{`Token Modifiers`}</Title>
          <BaseText>{`A variety of modifiers to buff your $FISH based on the token used!`}</BaseText>
          <ContainerRow>
            {/* <ContainerColumnSmall>
              <LogoImg src={eggImg}></LogoImg>
              <Text>{`Fish Egg (${web3.utils.fromWei(Constants._eggFee)} $FISHEGG)`}</Text>
              <SubText>{`Buff is a mystery!`}</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.fishEgg, Constants._feedFee, () => contractModifierFishProducts(fish, 1)); closeModal()}}>Consume Egg</BaseButton>
            </ContainerColumnSmall> */}
            <ContainerColumnSmall>
              <LogoImg src={scaleImg}></LogoImg>
              <Text>{`Fish Scales (${web3.utils.fromWei(Constants._scaleFee)} $FISHSCALE)`}</Text>
              <SubText>{`Prevent Fight power reduction for 3 Fights!`}</SubText>
              <BaseButton onClick={() => {contractApproveERC20Modifiers(FishFight.fishScale, Constants._scaleFee, () => contractModifierFishProducts(fish, 2)); closeModal()}}>Consume Scales</BaseButton>
            </ContainerColumnSmall>
          </ContainerRow>
        </ContainerWrapper>

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
          {!fish.stakedBreeding && !fish.stakedFighting &&
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

  /* background: linear-gradient(#caf0f8, #48cae4);
  box-shadow: inset 2px 2px 2px rgba(255, 255, 255, .3), inset -2px -2px 2px rgba(0, 0, 0, .3); */

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
    width: 120px;
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
`;


export default FishNFT;
