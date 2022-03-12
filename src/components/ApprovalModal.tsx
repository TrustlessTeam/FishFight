import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import Modal from 'react-modal';


import { useHarmony } from '../context/harmonyContext';
import { useFishFight } from '../context/fishFightContext';
import fishImg from "../img/icons/fish.svg"
import deadImg from "../img/icons/dead.svg"
import foodImg from "../img/icons/food.svg"
import { useFishPool } from '../context/fishPoolContext';
import web3 from 'web3';
import Countdown from 'react-countdown';
import BN from 'bn.js'
import { StakedFighting } from '../utils/fish';
import { Route, Routes } from 'react-router-dom';
import infoImg from "../img/icons/info.svg";
import waterImg from "../img/icons/water-dark.svg";
import { BaseOverlayContainer, ContainerControls, StyledModal } from './BaseStyles';
import BaseButton from "./BaseButton";
import { useContractWrapper } from '../context/contractWrapperContext';
import Account from './Account';
import LoadingOverlay from 'react-loading-overlay';


type Props = {
  // open: boolean;
};

const MAX_APPROVE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';


const ApprovalModal = ({}: Props) => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const { account } = useWeb3React();
	const { breedingFoodApproval, breedingFishApproval, trainingFoodApproval, fightingFishApproval, requireApproval, updateApproval, checkApprovals } = useFishFight();
	const { contractApproveAllFishForBreeding, contractApproveFoodForBreeding, contractApproveFoodForTraining, contractApproveAllForFighting, pendingTransaction, openApprovals, setOpenAppovals} = useContractWrapper();
	const [checked, setChecked] = React.useState(false);

	useEffect(() => {
		if(account) {
			checkApprovals(account)
		}
	}, [account]);

	const handleChange = () => {
    setChecked(!checked);
  };

	const toggleModel = () => {
		setModalIsOpen(!modalIsOpen);
	};

	const closeModal = () => {
		setModalIsOpen(false);
	};
	console.log(fightingFishApproval)

	const IndividualApprovals = () => {
		return(
			<CheckboxContainer>
				<label>
					<input
						type="checkbox"
						checked={checked}
						onChange={handleChange}
					/>
					(NOT RECOMMENDED) Handle approval and allowance per action when playing FishFight.
				</label>
				{checked &&
					<BaseButton onClick={() => {updateApproval(true, account); setOpenAppovals(false)}}>{'Confirm'}</BaseButton>
				}
			</CheckboxContainer>
		)
	}

	const TrainingApproval = () => {
		return (
			<StyledModal
				isOpen={openApprovals}
				className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<ContainerControls>
					{!account &&
						<Account mobile={false} textOverride={"Connect Wallet to Fight $FISH"}/>
					}
					<ApprovalsContainer>
						<ApprovalDisclaimer>
							<p>Approval Required: Training contract approval to control your $FISH is required for $FISH interations.</p>
							<OptionsContainer>
								{!trainingFoodApproval &&
								<>
									<BaseButton onClick={() => contractApproveFoodForTraining(MAX_APPROVE)}>{'Approve All $FISHFOOD'}</BaseButton>
									
								</>
								}
							</OptionsContainer>

							<IndividualApprovals></IndividualApprovals>
							
						</ApprovalDisclaimer>
					</ApprovalsContainer>	
				</ContainerControls>
			</StyledModal>
		)
	}

	const BreedingApproval = () => {
		return (
			<StyledModal
				isOpen={openApprovals}
				className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<ContainerControls>
					{!account &&
						<Account mobile={false} textOverride={"Connect Wallet to Fight $FISH"}/>
					}
					<ApprovalsContainer>
						<ApprovalDisclaimer>
							<p>Approval Required: Breeding contract approval to control your $FISH and send $FISHFOOD is required to Breed Fish.</p>
							<OptionsContainer>
							{!breedingFishApproval &&
								<BaseButton onClick={() => contractApproveAllFishForBreeding()}>{'Approve $FISH'}</BaseButton>
							}
							</OptionsContainer>
							<IndividualApprovals></IndividualApprovals>
						</ApprovalDisclaimer>
					</ApprovalsContainer>
				</ContainerControls>
			</StyledModal>
		)
	}

	const FightingApproval = () => {
		return (
			<StyledModal
				isOpen={openApprovals}
				className="Modal"
				overlayClassName="Overlay"
				onRequestClose={closeModal}
				shouldCloseOnOverlayClick
			>
				<ContainerControls>
						{!account &&
							<Account mobile={false} textOverride={"Connect Wallet to Fight $FISH"}/>
						}
					<ApprovalsContainer>
						<ApprovalDisclaimer>
							<p>Approval Required: Fighting contract approval to control your $FISH is required to Fight Fish.</p>
							<OptionsContainer>
								{!fightingFishApproval &&
									<BaseButton onClick={() => contractApproveAllForFighting()}>{'Approve $FISH'}</BaseButton>
								}
							</OptionsContainer>
						</ApprovalDisclaimer>
						<IndividualApprovals></IndividualApprovals>
					</ApprovalsContainer>
				</ContainerControls>
			</StyledModal>
		)
	}

	if(!account) return null;

	return (
		<ApprovalsContainer
			active={pendingTransaction}
			spinner
			text='Waiting for confirmation...'
			>
				{account && 
				<Routes>
					<Route path="ocean" element={<TrainingApproval />} />
					<Route path="ocean:id" element={<TrainingApproval />} />
					{/* <Route path="fishing" element={fishingData()} />
					<Route path="fishing/:id" element={fishingData()} /> */}
					<Route path="fighting" element={<FightingApproval />} />
					<Route path="fighting/:id" element={<FightingApproval />} />
					<Route path="breeding" element={<BreedingApproval />} />
					<Route path="breeding/:id" element={<BreedingApproval />} />
				</Routes>
				}
		</ApprovalsContainer>	
	)
	
};


export default ApprovalModal;

export const ApprovalsContainer = styled(LoadingOverlay)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;

export const ApprovalDisclaimer = styled.div`
	padding: ${props => props.theme.spacing.gap};
	border-radius: 25px;
`;


const CheckboxContainer = styled.div`
	/* display: flex;
	flex-direction: column;
	justify-content: center; */
	padding-top: ${props => props.theme.spacing.gap};
`

export const OptionsContainer = styled.div`
	display: flex;
	flex-flow: row nowrap;
	justify-content: center;
	align-items: center;
`;