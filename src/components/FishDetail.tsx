// @ts-nocheck
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUnity } from "../context/unityContext";
import { useWeb3React } from "@web3-react/core";
import { useContractWrapper } from "../context/contractWrapperContext";
import { useFishFight } from "../context/fishFightContext";
import { useFishPool } from "../context/fishPoolContext";
import Fish from "../utils/fish";
import styled from "styled-components";
import {
  BaseContainer,
  BaseTitle,
  ContainerColumn,
  ContainerRow,
  BaseText,
  BaseLinkButton,
} from "./BaseStyles";
import FishNFT from "./FishNFT";
import BuffModal from "./BuffModal";
import DepositModal from "./DepositModal";

const METADATA_SERVER_URL =
  process.env.NEXT_PUBLIC_METADATA_SERVER_URL ||
  process.env.REACT_APP_SERVER_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://fishfight-server-production.up.railway.app'
    : 'http://localhost:3001');

const FishDetail = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const unityContext = useUnity();
  const { account } = useWeb3React();
  const { FishFight } = useFishFight();
  const { createUserFish } = useFishPool();
  
  const [fish, setFish] = useState<Fish | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpenDeposit, setModalIsOpenDeposit] = useState(false);

  const {
    feedFish,
    claimFishFood,
    questFish,
    depositBreedingFish,
    depositFightingFish,
    smartWithdraw,
    withdrawBreedingFish,
  } = useContractWrapper();

  // Fetch fish data from contract
  useEffect(() => {
    const fetchFish = async () => {
      if (!tokenId || !FishFight?.readFishFactory) {
        setError('Invalid token ID or contract not loaded');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to get fish from contract using createUserFish (works for any fish, not just user's)
        const fishData = await createUserFish(parseInt(tokenId));
        
        if (fishData) {
          setFish(fishData);
          // Show fish in Unity
          if (unityContext.isFishPoolReady) {
            unityContext.showFish(fishData);
          }
        } else {
          setError(`Fish #${tokenId} not found`);
        }
      } catch (err: any) {
        console.error('Error fetching fish:', err);
        setError(err.message || 'Failed to fetch fish data');
      } finally {
        setLoading(false);
      }
    };

    fetchFish();
  }, [tokenId, FishFight, createUserFish, unityContext]);

  // Fetch metadata from server
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenId) return;

      try {
        const response = await fetch(`${METADATA_SERVER_URL}/fish/${tokenId}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        // Don't set error - metadata is optional
      }
    };

    fetchMetadata();
  }, [tokenId]);

  // Setup Unity event handlers
  useEffect(() => {
    if (!fish || !unityContext.UnityInstance) return;

    unityContext.UnityInstance.on("UISelectionConfirm", function (data: any) {
      switch (data) {
        case "feed_confirm":
          feedFish(fish);
          return;
        case "collect_confirm":
          claimFishFood(fish);
          return;
        case "quest_confirm":
          toggleModal();
          return;
        case "deposit_fight_confirm":
          toggleModalDeposit();
          return;
        case "withdraw_fight_confirm":
          smartWithdraw(fish);
          return;
        case "deposit_breed_confirm":
          depositBreedingFish(fish);
          return;
        case "withdraw_breed_confirm":
          withdrawBreedingFish(fish);
          return;
        default:
          return;
      }
    });
  }, [fish, unityContext.UnityInstance]);

  // Initialize Unity view
  useEffect(() => {
    if (!unityContext.isFishPoolReady) return;

    const timeout = setTimeout(() => {
      unityContext.clearUIFish();
      unityContext.showOceanLocation();
    }, 200);

    return () => clearTimeout(timeout);
  }, [unityContext.isFishPoolReady]);

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen);
  };

  const toggleModalDeposit = () => {
    setModalIsOpenDeposit(!modalIsOpenDeposit);
  };

  if (loading) {
    return (
      <BaseContainer>
        <LoadingContainer>
          <BaseTitle>Loading Fish #{tokenId}...</BaseTitle>
        </LoadingContainer>
      </BaseContainer>
    );
  }

  if (error || !fish) {
    return (
      <BaseContainer>
        <ErrorContainer>
          <BaseTitle>Fish Not Found</BaseTitle>
          <BaseText>{error || `Fish #${tokenId} does not exist`}</BaseText>
          <BaseLinkButton to="/ocean">Back to Ocean</BaseLinkButton>
        </ErrorContainer>
      </BaseContainer>
    );
  }

  return (
    <BaseContainer>
      {fish && (
        <>
          <BuffModal
            fish={fish}
            modalIsOpen={modalIsOpen}
            toggleModal={toggleModal}
          />
          <DepositModal
            fish={fish}
            modalIsOpen={modalIsOpenDeposit}
            toggleModal={toggleModalDeposit}
          />
        </>
      )}

      <DetailContainer>
        <HeaderRow>
          <BaseLinkButton to="/ocean">← Back to Ocean</BaseLinkButton>
          <BaseTitle>Fish #{tokenId}</BaseTitle>
        </HeaderRow>

        <ContentRow>
          <FishColumn>
            {fish && (
              <FishNFT
                fish={fish}
                itemId={`fish-${fish.tokenId}`}
                onClick={() => unityContext.showFish(fish)}
                selectedUser={account === fish.owner}
                fishPool={account === fish.owner ? 1 : 0}
                buffModal={toggleModal}
              />
            )}
          </FishColumn>

          <StatsColumn>
            <BaseTitle>Stats</BaseTitle>
            {fish && (
              <>
                <StatRow>
                  <StatLabel>Strength:</StatLabel>
                  <StatValue>{fish.strength}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Intelligence:</StatLabel>
                  <StatValue>{fish.intelligence}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Agility:</StatLabel>
                  <StatValue>{fish.agility}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Rarity:</StatLabel>
                  <StatValue>{fish.rarityName}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Generation:</StatLabel>
                  <StatValue>{fish.generation}</StatValue>
                </StatRow>
                <StatRow>
                  <StatLabel>Lifetime Wins:</StatLabel>
                  <StatValue>{fish.lifetimeWins}</StatValue>
                </StatRow>
                {fish.owner && (
                  <StatRow>
                    <StatLabel>Owner:</StatLabel>
                    <StatValue>{fish.owner.slice(0, 6)}...{fish.owner.slice(-4)}</StatValue>
                  </StatRow>
                )}
              </>
            )}

            {metadata && (
              <>
                <BaseTitle style={{ marginTop: '20px' }}>Metadata</BaseTitle>
                {metadata.attributes && metadata.attributes.map((attr: any, idx: number) => (
                  <StatRow key={idx}>
                    <StatLabel>{attr.trait_type}:</StatLabel>
                    <StatValue>{attr.value}</StatValue>
                  </StatRow>
                ))}
                {metadata.image && (
                  <ImageContainer>
                    <BaseText>Image:</BaseText>
                    <FishImage src={metadata.image} alt={`Fish #${tokenId}`} />
                  </ImageContainer>
                )}
              </>
            )}
          </StatsColumn>
        </ContentRow>
      </DetailContainer>
    </BaseContainer>
  );
};

const DetailContainer = styled.div`
  padding: 20px;
  padding-top: 100px;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
`;

const HeaderRow = styled(ContainerRow)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const ContentRow = styled(ContainerRow)`
  gap: 40px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FishColumn = styled(ContainerColumn)`
  flex: 1;
  align-items: center;
  min-width: 300px;
`;

const StatsColumn = styled(ContainerColumn)`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
`;

const StatRow = styled(ContainerRow)`
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const StatLabel = styled(BaseText)`
  font-weight: bold;
  margin: 0;
`;

const StatValue = styled(BaseText)`
  margin: 0;
`;

const ImageContainer = styled(ContainerColumn)`
  margin-top: 20px;
  align-items: center;
`;

const FishImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-top: 10px;
`;

const LoadingContainer = styled(ContainerColumn)`
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding-top: 100px;
`;

const ErrorContainer = styled(ContainerColumn)`
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding-top: 100px;
  gap: 20px;
`;

export default FishDetail;

