import React, { useState } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";

import {
  BaseText,
  StyledModal,
  Title,
} from "./BaseStyles";
import BaseButton from "./BaseButton";
import { useContractWrapper } from "../context/contractWrapperContext";
import { Constants } from "../utils/constants";
import { useFishFight } from "../context/fishFightContext";

const DisclaimerModal = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { account } = useWeb3React();
  const { currentPhase } = useFishFight();
  const {
    showTrainingFoodApproval,
    showFightingFoodApproval,
    showBreedingFishApproval,
    showBreedingFoodApproval,
    showFightingFishApproval,
		showERC20Approval,
    showFightingDisclaimer,
    showFightingNonLethalDisclaimer,
    showFightingNonLethalDepositDisclaimer,
    showBreedingDisclaimer,
    onAccept,
  } = useContractWrapper();

  const toggleModel = () => {
    setModalIsOpen(!modalIsOpen);
  };



  const TrainingApproval = () => {
    return (
      <>
        <Title>Training Contract Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Feeding and Upgrading Fish requires
            spending $FISHFOOD. Max allowance is set to reduce future approvals.
          </Text>
          <OptionsContainer>
            {/* {!trainingFoodApproval && !checked &&
						<BaseButton onClick={() => contractApproveFoodForTraining(MAX_APPROVE)}>{'Approve All $FISHFOOD'}</BaseButton>
					} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const FightingFoodApproval = () => {
    return (
      <>
        <Title>Non Lethal Fighting Contract Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Fighting in Non-Lethal Pools requires
            spending $FISHFOOD. Max allowance is set to reduce future approvals.
          </Text>
          <OptionsContainer>
            {/* {!trainingFoodApproval && !checked &&
						<BaseButton onClick={() => contractApproveFoodForTraining(MAX_APPROVE)}>{'Approve All $FISHFOOD'}</BaseButton>
					} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const BreedingFoodApproval = () => {
    return (
      <>
        <Title>Breeding Contract $FISHFOOD Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Breeding requires
            spending $FISHFOOD + ONE. Max allowance is set to reduce future approvals.
          </Text>
        </ContainerText>
      </>
    );
  };

	const ModifierApproval = () => {
    return (
      <>
        <Title>Modifier Contract Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Upgrading Fish requires
            spending certain ERC20 tokens.
          </Text>
          <OptionsContainer>
            {/* {!trainingFoodApproval && !checked &&
						<BaseButton onClick={() => contractApproveFoodForTraining(MAX_APPROVE)}>{'Approve All $FISHFOOD'}</BaseButton>
					} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const BreedingApproval = () => {
    return (
      <>
        <Title>Breeding Contract Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Depositing Alpha Fish requires
            approval of your $FISH. Approval for all $FISH is set to prevent
            many future approvals.
          </Text>
          <OptionsContainer>
            {/* {!breedingFishApproval && !checked &&
					<BaseButton onClick={() => contractApproveAllFishForBreeding()}>{'Approve All $FISH'}</BaseButton>
				} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const FightingApproval = () => {
    return (
      <>
        <Title>Fighting Contract Approval</Title>
        <ContainerText>
          <Text>
            <span>Approval Required! </span>Fighting Fish requires approval of
            your $FISH. Approval for all $FISH is set to prevent many future
            approvals.
          </Text>
          <OptionsContainer>
            {/* {!fightingFishApproval && !checked &&
							<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
						} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const FightingDisclaimer = () => {
    return (
      <>
        <Title>Fighting Disclaimer</Title>
        <ContainerText>
          <Text>
            <span>Warning! </span>Fighting Fish results in the{" "}
            <span>DEATH (token burned)</span> of the losing $FISH.
          </Text>
          <Text>
            The loser will receive a $DEADFISH token in place of their now
            burned $FISH token, plus any $FISHFOOD the $FISH had earned while in
            the Fight Pool.
          </Text>
          <Text>
            The FREE FOR ALL FIGHTING POOL Fight winner gains{" "}
            {currentPhase?.phase === 2
              ? web3.utils.fromWei(Constants._fishFoodPerWinInPhase)
              : web3.utils.fromWei(Constants._fishFoodPerWin)}{" "}
            $FISHFOOD.<br></br>
            The STATS UNDER 50 FIGHTING POOL winner gains{" "}
            {currentPhase?.phase === 2
              ? web3.utils.fromWei(Constants._fishFoodPerWinInPhaseWeak)
              : web3.utils.fromWei(Constants._fishFoodPerWinWeak)}{" "}
            $FISHFOOD. <br></br>
            The winner becomes an ALPHA $FISH -- making them eligible
            for the Breed Pool and rewards.
          </Text>
          <Text>
            When you trigger a Fight, your fish will be deposited in the Fight
            pool and locked for {Constants._lockTime / 60} minutes. During that
            time your $FISH is still at risk of being attacked and dying!
          </Text>
          <Text>
            Depositing via a Fight or from a Deposit, will make your Fish
            eligible to a share of the Fight Pool emission rewards.<br></br>
            FREE FOR ALL : {" "}{web3.utils.fromWei(Constants._fishFoodPerBlock)} $FISHFOOD per
            block.<br></br>
            STATS UNDER 50 : {" "}{web3.utils.fromWei(Constants._fishFoodPerBlockWeak)} $FISHFOOD per
            block.
          </Text>

          <Text>
            Approving the transaction is your agreement to these terms. Good
            luck!
          </Text>
          <OptionsContainer>
            {/* {!fightingFishApproval && !checked &&
								<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
							} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const FightingNonLethalDisclaimer = () => {
    return (
      <>
        <Title>Non-Lethal Fight Disclaimer</Title>
        <ContainerText>
          <Text>
            <span>Warning! </span>This will start a Fight between your deposited Fish and your selected opponent in the pool.
          </Text>
          <Text>
            Winning a Fight will prevent your Fish from starting another fight for {Constants._cooldownTimeNonLethal / 60} minutes.
          </Text>
          <Text>Win reward: {" "}
          {currentPhase?.phase === 2
              ? web3.utils.fromWei(Constants._fishFoodPerWinInPhaseNonLethal)
              : web3.utils.fromWei(Constants._fishFoodPerWinNonLethal)}{" "}
            $FISHFOOD.<br></br> Rewards are paid out on removal from the Fight pool.
          </Text>
          <Text>
            Losing Fights: in the event of a loss, your Fish will be removed from the pool and returned to you! It is NOT burned.
          </Text>
          <Text>
            Approving the transaction is your agreement to these terms. Good
            luck!
          </Text>
          <OptionsContainer>
            {/* {!fightingFishApproval && !checked &&
								<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
							} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const FightingNonLethalDepositDisclaimer = () => {
    return (
      <>
        <Title>Non-Lethal Deposit Disclaimer</Title>
        <ContainerText>
          <Text>
            <span>DEPOSIT Warning! </span>Non-Lethal Fighting Pools cost <span>{web3.utils.fromWei(Constants._fishFoodDepositFee)} $FISHFOOD</span> to enter!
          </Text>
          <Text>
            Fish in the pool are eligible to a share of the Non-Lethal Fight Pool emission rewards.<br></br>
            {" "}{web3.utils.fromWei(Constants._fishFoodPerBlockNonLethal)} $FISHFOOD per block.<br></br>
          </Text>
          <Text>
            Winning Fights: in the event of a win, your Fish earns {" "}
            {web3.utils.fromWei(Constants._fishFoodPerWinInPhaseNonLethal)}{" "}
            $FISHFOOD in Fighting Phase OR {web3.utils.fromWei(Constants._fishFoodPerWinNonLethal)} $FISHFOOD out of phase.<br></br>
            You also get to stay in the pool! So keep fighting until you are out! Note: There is a {Constants._cooldownTimeNonLethal / 60} minutes cooldown
            before you can attack another Fish.
          </Text>
          <Text>
            Losing Fights: in the event of a loss, your Fish will be removed from the pool and returned to you! It is NOT burned.
          </Text>
          <Text>
            <span>Rewards </span>are paid out on withdrawl or once your winning Fish eventually loses. You can view pending awards in the FishFight menu.
          </Text>
          <Text>
            Approving the transaction is your agreement to these terms. Good
            luck!
          </Text>
          <OptionsContainer>
            {/* {!fightingFishApproval && !checked &&
								<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
							} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  const BreedingDisclaimer = () => {
    return (
      <>
        <Title>Breeding Disclaimer</Title>
        <ContainerText>
          <Text>
            Breeding as the BETTA $FISH will consume{" "}
            <span>{Constants._bettaBreedPowerFee}</span> of your $FISH's power,  <span>{currentPhase?.phase === 3 ? web3.utils.fromWei(Constants._oneBreedFeeInPhase) : web3.utils.fromWei(Constants._oneBreedFeeInPhase)} ONE</span> + <span>{web3.utils.fromWei(Constants._fishFoodBreedFee)} $FISHFOOD</span>, and put your
            $FISH in a breed cooldown for {Constants._bettaBreedCooldown}.
          </Text>
          <Text>
            The BETTA $FISH will receive the NEW $FISH, and the ALPHA $FISH will
            receive{" "}
            {currentPhase?.phase === 3
              ? web3.utils.fromWei(Constants._alphaFoodOwedFeeInPhase)
              : web3.utils.fromWei(Constants._alphaFoodOwedFee)}{" "}
            $FISHFOOD
          </Text>
          <Text>
            Approving the transaction is your agreement to these terms. Good
            luck!
          </Text>
          <OptionsContainer>
            {/* {!fightingFishApproval && !checked &&
								<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
							} */}
          </OptionsContainer>
        </ContainerText>
      </>
    );
  };

  if (!account) return null;

  return (
    <StyledModal
      isOpen={
        showBreedingFishApproval ||
        showBreedingFoodApproval ||
        showFightingFishApproval ||
        showTrainingFoodApproval ||
        showFightingFoodApproval ||
        showFightingDisclaimer ||
        showFightingNonLethalDisclaimer ||
        showFightingNonLethalDepositDisclaimer ||
        showBreedingDisclaimer ||
        showERC20Approval
      }
      className="Modal"
      overlayClassName="Overlay"
      // onRequestClose={onAccept}
      shouldCloseOnOverlayClick
    >
      <ApprovalsContainer>
        <ApprovalDisclaimer>
          {showFightingFishApproval && <FightingApproval></FightingApproval>}
          {showFightingFoodApproval && <FightingFoodApproval></FightingFoodApproval>}
          {showBreedingFishApproval && <BreedingApproval></BreedingApproval>}
          {showBreedingFoodApproval && <BreedingFoodApproval></BreedingFoodApproval>}
          {showTrainingFoodApproval && <TrainingApproval></TrainingApproval>}
          {showFightingDisclaimer && <FightingDisclaimer></FightingDisclaimer>}
          {showFightingNonLethalDisclaimer && <FightingNonLethalDisclaimer></FightingNonLethalDisclaimer>}
          {showFightingNonLethalDepositDisclaimer && <FightingNonLethalDepositDisclaimer></FightingNonLethalDepositDisclaimer>}
          {showBreedingDisclaimer && <BreedingDisclaimer></BreedingDisclaimer>}
          {showERC20Approval && <ModifierApproval></ModifierApproval>}
          {(showFightingFishApproval ||
            showBreedingFishApproval ||
            showTrainingFoodApproval) && (
            <BaseText>
              If you prefer to do individual approvals or allowance, go to
              Account tab and select that option.
            </BaseText>
          )}
          <BaseButton onClick={onAccept}>Accept</BaseButton>
        </ApprovalDisclaimer>
      </ApprovalsContainer>
    </StyledModal>
  );
};

export default DisclaimerModal;

const Text = styled.p`
  color: white;
  margin: 0;
  font-weight: bold;
  padding-bottom: ${(props) => props.theme.spacing.gap};

  span {
    color: red;
  }
`;

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
