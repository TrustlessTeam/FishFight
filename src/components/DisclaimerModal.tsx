import React, { useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';




import { BaseOverlayContainer, BaseText, ContainerControls, StyledModal, Title } from './BaseStyles';
import BaseButton from "./BaseButton";
import { useContractWrapper } from '../context/contractWrapperContext';
import LoadingOverlay from 'react-loading-overlay';



const DisclaimerModal = () => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const { account } = useWeb3React();
	// const { breedingFishApproval, trainingFoodApproval, fightingFishApproval } = useFishFight();
	const { showTrainingFoodApproval, showBreedingFishApproval, showFightingFishApproval, showFightingDisclaimer,  } = useContractWrapper();
	
	console.log(showFightingDisclaimer)

	const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const TrainingApproval = () => {
		return (
			<ContainerText>
				<Text><span>Approval Required! </span>Feeding and Upgrading Fish requires spending $FISHFOOD. Max allowance is set to reduce future approvals.</Text>
				<OptionsContainer>
					{/* {!trainingFoodApproval && !checked &&
						<BaseButton onClick={() => contractApproveFoodForTraining(MAX_APPROVE)}>{'Approve All $FISHFOOD'}</BaseButton>
					} */}
				</OptionsContainer>
			</ContainerText>
		)
	}

	const BreedingApproval = () => {
		return (
			<ContainerText>
				<Text><span>Approval Required! </span>Depositing Alpha Fish requires approval of your $FISH. Approval for all $FISH is set to prevent many future approvals.</Text>
				<OptionsContainer>
				{/* {!breedingFishApproval && !checked &&
					<BaseButton onClick={() => contractApproveAllFishForBreeding()}>{'Approve All $FISH'}</BaseButton>
				} */}
				</OptionsContainer>
			</ContainerText>
			
		)
	}

	const FightingApproval = () => {
		return (
			<ContainerText>
				<Text><span>Approval Required! </span>Fighting Fish requires approval of your $FISH. Approval for all $FISH is set to prevent many future approvals.</Text>
					<OptionsContainer>
						{/* {!fightingFishApproval && !checked &&
							<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
						} */}
					</OptionsContainer>
			</ContainerText>
		)
	}

	const FightingDisclaimer = () => {
		return (
			<ContainerText>
				<Text><span>Warning! </span>Fighting Fish results in the losing $FISH <span>dying</span> (token burned). The loser will receive a $DEADFISH token in place of their now burned $FISH token. The winner of the fight will become an Alpha $FISH and may be staked in the Breed Pool to earn $FISHFOOD when selected to breed with by a Betta $FISH.  Approving the transaction is your agreement to these terms. Good luck!</Text>
					<OptionsContainer>
						{/* {!fightingFishApproval && !checked &&
							<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve All $FISH'}</BaseButton>
						} */}
					</OptionsContainer>
			</ContainerText>
		)
	}

	if(!account) return null;

	return (
		<StyledModal
				isOpen={showBreedingFishApproval || showFightingFishApproval || showTrainingFoodApproval || showFightingDisclaimer}
				className="Modal"
				overlayClassName="Overlay"
				// onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<ApprovalsContainer>
					<ApprovalDisclaimer>
						<Title>Contract Approval</Title>
						{showFightingFishApproval &&
							<FightingApproval></FightingApproval>
						}
						{showBreedingFishApproval &&
							<BreedingApproval></BreedingApproval>
						}
						{showTrainingFoodApproval &&
							<TrainingApproval></TrainingApproval>
						}
						{showFightingDisclaimer &&
							<FightingDisclaimer></FightingDisclaimer>
						}
						{(showFightingFishApproval || showBreedingFishApproval || showTrainingFoodApproval) &&
							<BaseText>If you prefer to do individual approvals or allowance, go to Account tab and check box.</BaseText>
						}
					</ApprovalDisclaimer>
					
				</ApprovalsContainer>
		</StyledModal>

	)
	
};


export default DisclaimerModal;

const Text = styled.p`
	color: white;
	margin: 0;
	font-weight: bold;

	span {
		color: black;
	}
`;

export const ContainerText = styled.div`
	padding-top: ${props => props.theme.spacing.gapSmall};
`;

export const ApprovalsContainer = styled(LoadingOverlay)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;

export const ApprovalDisclaimer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;

export const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;