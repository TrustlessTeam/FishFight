import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import web3 from 'web3'
import axios from 'axios';
import FishFight from '../FishFightSDK';
import { useUnity } from './fishFightUnityContext';
import Contracts from '../contracts/contracts.json';
import BN from 'bn.js';


import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';

const MAX_FISH = 20;
const serverURL = `https://fishfight.io`;
// const serverURL = `http://localhost:5000`;

interface FishPoolProviderContext {
	userFish: Fish[]
  oceanFish: Fish[]
	fightingFish: Fish[]
	fightingFishWeak: Fish[]
	breedingFish: Fish[]
	userFishIndex: number
	oceanFishIndex: number
	breedingFishIndex: number
	fightingFishIndex: number
  loadingFish: boolean
  loadingUserFish: boolean
  refreshFish: (tokenId: number, isFighting: boolean, isBreeding: boolean) => Promise<Fish | null>
  createUserFish: (tokenId: number) => Promise<Fish | null>;
  fetchOceanFish: (startIndex?: number, random?: boolean) => void
  fetchUserFish: (account: string, startIndex?: number) => void
  fetchFightingFish: () => void
  fetchBreedingFish: () => void
  refreshLoadedFish: () => void;
  loadMoreFish: (type: number) => void;
}

export enum PoolFish {
  Ocean,
  User,
  Fighting,
  FightingWeak,
  Breeding,
  UserFighting,
  UserBreeding
}

export enum PoolTypes {
  Fighting,
  FightingWeak,
  Breeding,
  Ocean
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const FishPoolContext = createContext<FishPoolProviderContext | undefined>(undefined);

// Defining context provider
export const FishPoolProvider = ({ children }: UnityProviderProps) => {

  const [userFishIndex, setUserFishIndex] = useState<number>(0);
  const [loadingFish, setLoadingFish] = useState(true);
  const [loadingUserFish, setLoadingUserFish] = useState(false);
  const [oceanFishIndex, setOceanFishIndex] = useState<number>(0);
  const [breedingFishIndex, setBreedingFishIndex] = useState<number>(0);
  const [fightingFishIndex, setFightingFishIndex] = useState<number>(0);
  const [fightingFishWeakIndex, setFightingFishWeakIndex] = useState<number>(0);
  const [oceanFish, setOceanFish] = useState<Fish[]>([]);
	const [userFish, setUserFish] = useState<Fish[]>([]);
	const [fightingFish, setFightingFish] = useState<Fish[]>([]);
	const [fightingFishWeak, setFightingFishWeak] = useState<Fish[]>([]);
  const [breedingFish, setBreedingFish] = useState<Fish[]>([]);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  const { account, deactivate } = useWeb3React();
  const { FishFight, refetchStats, refetchBalance } = useFishFight();
	const unityContext = useUnity();

  useEffect(() => {
    // Set websocket block listener
    FishFight.listenFishFactory.events.FishBurned()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.tokenId) {
        fishBurned(web3.utils.toNumber(data.returnValues.tokenId));
      }
    })

    FishFight.listenFishFactory.events.FishMinted()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.tokenId) {
        // console.log("Fish Caught - refetching data")
        refetchStats();
      }
    })

    FishFight.listenFightingWaters.events.Deposit()
    .on("data", function(data: any){
      // console.log(data)
      // console.log(data.returnValues.user)
      // console.log("FIGHITNG DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenFightingWatersWeak.events.Deposit()
    .on("data", function(data: any){
      // console.log(data)
      // console.log(data.returnValues.user)
      // console.log("FIGHITNG DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishWeakById(data.returnValues.tokenId)
      }
    })

    FishFight.listenFightingWaters.events.Withdraw()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenFightingWatersWeak.events.Withdraw()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishWeakById(data.returnValues.tokenId)
      }
    })

    FishFight.listenBreedingWaters.events.Deposit()
    .on("data", function(data: any){
      // console.log(data)
      // console.log("BREEDING DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addBreedingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenBreedingWaters.events.Withdraw()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeBreedingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenCycles.events.NewPhase()
    .on("data", function(data: any){
      // console.log(data)
      if(data.returnValues.newPhase) {
        refetchStats();
      }
    })

    // FishFight.listenCycles.events.CycleCompleted()
    // .on("data", function(data: any){
    //   console.log(data)
    //   if(data.returnValues.seasonIndex) {
    //     refetchStats();
    //     refreshLoadedFish()
    //   }
    // })
  }, [])

  useEffect(() => {
    if(connectedAccount != null && account == null) {
      setConnectedAccount(null);
      setUserFish([])
    }
  }, [account])

  useEffect(() => {
    const loadTokenData = async () => {
      // console.log("ACCOUNT NOT CONNECTED")
      // console.log("Getting public fish")
      fetchOceanFish(1, false);
      fetchFightingFish();
      fetchFightingFishWeak();
      fetchBreedingFish();
    }
		loadTokenData();
  }, []);

  // Load connected user fish data from the blockchain
  useEffect(() => {
    const loadTokenData = async (account: string | null | undefined) => {
      if(account && !loadingFish) {
        // Clear user fish in case of account switch
        // console.log("ACCOUNT CONNECTED")
        console.log("Getting user fish")
        fetchUserFish(account);
        // fetchUserFightingFish(account);
        // fetchUserBreedingFish(account);
      }
    }
		if(unityContext.isFishPoolReady) loadTokenData(account);
  }, [account, unityContext.isFishPoolReady, loadingFish]);

  const loadMoreFish = (type: number) => {
    if(type === PoolFish.Ocean) {
      fetchOceanFish(oceanFishIndex, false);
    }
    if(type === PoolFish.User && account) {
      fetchUserFish(account, userFishIndex);
    }
    if(type === PoolFish.Fighting) {
      fetchFightingFish(fightingFishIndex);
    }
    if(type === PoolFish.FightingWeak) {
      fetchFightingFishWeak(fightingFishWeakIndex);
    }
    if(type === PoolFish.Breeding) {
      fetchBreedingFish(breedingFishIndex);
    }
  }

  const fetchOceanFish = async (startIndex?: number, random?: boolean) => {
    // console.log("Loading Ocean Fish")
    try {
      setLoadingFish(true);
      let randomFish: string[];
      if(random) {
        randomFish = await FishFight.fishCalls.methods.getFish(1, true).call()

      } else {
        
        randomFish = await FishFight.fishCalls.methods.getFish(startIndex ? startIndex : 1, false).call()
      }
      console.log(randomFish)
      let oceanIds = [...new Set(randomFish)].filter((val) => {
        return val !== '0';
      });

      await Promise.all(oceanIds.map(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!oceanFish.some(fish => fish.tokenId == parsedTokenId)) {
          const fishData = await buildFish(FishFight, web3.utils.toNumber(parsedTokenId))
          if(fishData != null) {
            setOceanFish(prevData => [...prevData, fishData])
          }
        }
      }));

      setLoadingFish(false);
      const [lastItem] = oceanIds.slice(-1)
      setOceanFishIndex(web3.utils.toNumber(lastItem))

    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserFish = async (account: string, startIndex?: number) => {
    // console.log("Loading User Fish")
    try {
      // console.log(startIndex)
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingUserFish(true);
      
      // let userFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, account, FishFight.readFishFactory.options.address).call()
      // userFishIds = [...new Set(userFishIds)].filter((val) => {
      //   return val !== '0';
      // });
      const fishUserOwns = await FishFight.readFishFactory.methods.balanceOf(account).call();
      const numUserFish = web3.utils.toBN(fishUserOwns).toNumber();
      const userFishIds = [...Array(numUserFish).keys()].map(x => x++);
      await Promise.all(userFishIds.map(async index => {
        const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, index).call();
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
      }));
      setUserFishIndex(userFishIds.length)


      // User Fighting Pool Fish
      const stakedFightFishUserOwns = await FishFight.readFightingWaters.methods.balanceOf(account).call();
      const numUserFightingFish = web3.utils.toBN(stakedFightFishUserOwns).toNumber();
      const fightingFishIds = [...Array(numUserFightingFish).keys()].map(x => x++);
      await Promise.all(fightingFishIds.map(async index => {
        const tokenId = await FishFight.readFightingWaters.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
          
      }));

      // User Weak Fighting Pool Fish
      const stakedFightFishWeakUserOwns = await FishFight.readFightingWatersWeak.methods.balanceOf(account).call();
      const numUserFightingFishWeak = web3.utils.toBN(stakedFightFishWeakUserOwns).toNumber();
      const fightingFishIdsWeak = [...Array(numUserFightingFishWeak).keys()].map(x => x++);
      await Promise.all(fightingFishIdsWeak.map(async index => {
        const tokenId = await FishFight.readFightingWatersWeak.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
          
      }));

      // load all user breeding and concat them
      const stakedBreedFishUserOwns = await FishFight.readBreedingWaters.methods.balanceOf(account).call();
      const numUserBreedingFish = web3.utils.toBN(stakedBreedFishUserOwns).toNumber();
      const breedingFishIds = [...Array(numUserBreedingFish).keys()].map(x => x++);
      await Promise.all(breedingFishIds.map(async index => {
        const tokenId = await FishFight.readBreedingWaters.methods.tokenOfOwnerByIndex(account, index).call()
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addUserFishById(parsedTokenId)
        }
          
      }));


      setLoadingUserFish(false);

      // const fishUserOwns = await FishFight.readFishFactory.methods.balanceOf(account).call();
      // console.log(`User owns: ${fishUserOwns}`)
      // const numUserFish = web3.utils.toBN(fishUserOwns).toNumber();
      // for(let i = 0; i < numUserFish; i++) {
      //   FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, i).call()
      //   .then((tokenId: any) => {
      //     if(!userFish.some(fish => fish.tokenId == tokenId)) {
      //       addUserFishById(web3.utils.toNumber(tokenId));
      //     }
      //   });
      // }

    } catch (error) {
      console.log("Error loading Fish tokens owned by account: ")
      console.log(error)
    }
  }

  const fetchUserFightingFish = async (account: string) => {
    // console.log("Loading User Fighting Fish")
    try {
      const stakedFishUserOwns = await FishFight.readFightingWaters.methods.balanceOf(account).call();
      // console.log(`User staked owns: ${stakedFishUserOwns}`)
      const numUserFish = web3.utils.toBN(stakedFishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        FishFight.readFightingWaters.methods.tokenOfOwnerByIndex(account, i).call()
        .then((tokenId: any) => {
          addUserFishById(web3.utils.toNumber(tokenId))
        });
      }
    } catch (error) {
      console.log("Error loading staked Fighting Fish tokens for account: ")
      console.log(error)
    }
  }

  const fetchFightingFish = async (startIndex?: number) => {
    // console.log("Loading Fighting Fish")
    const fightingWatersAddress = FishFight.readFightingWaters.options.address
    try {

      // console.log(startIndex)
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let fightingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, fightingWatersAddress, FishFight.readFishFactory.options.address).call()
      fightingFishIds = [...new Set(fightingFishIds)].filter((val) => {
        return val !== '0';
      });

      // console.log(fightingFishIds)
      await Promise.all(fightingFishIds.map(async tokenId => {
      // const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, index).call();
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!fightingFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addFightingFishById(parsedTokenId)
        }
        // setUserFishIndex(parsedTokenId);
      }));

      setFightingFishIndex(fightingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Fighting Fish: ")
      console.log(error)
    }
  }

  const fetchFightingFishWeak = async (startIndex?: number) => {
    // console.log("Loading Fighting Fish")
    const fightingWatersAddressWeak = FishFight.readFightingWatersWeak.options.address
    try {

      // console.log(startIndex)
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let fightingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, fightingWatersAddressWeak, FishFight.readFishFactory.options.address).call()
      fightingFishIds = [...new Set(fightingFishIds)].filter((val) => {
        return val !== '0';
      });

      // console.log(fightingFishIds)
      await Promise.all(fightingFishIds.map(async tokenId => {
      // const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, index).call();
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!fightingFishWeak.some(fish => fish.tokenId === parsedTokenId)) {
          await addFightingFishWeakById(parsedTokenId)
        }
        // setUserFishIndex(parsedTokenId);
      }));

      setFightingFishWeakIndex(fightingFishIds.length)
      setLoadingFish(false);
    } catch (error) {
      console.log("Error Fighting Fish: ")
      console.log(error)
    }
  }

  const fetchUserBreedingFish = async (account: string) => {
    // console.log("Loading User Breeding Fish")
    try {
      const stakedFishUserOwns = await FishFight.readBreedingWaters.methods.balanceOf(account).call();
      // console.log(`User staked owns: ${stakedFishUserOwns}`)
      const numUserFish = web3.utils.toBN(stakedFishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        FishFight.readBreedingWaters.methods.tokenOfOwnerByIndex(account, i).call()
        .then((tokenId: any) => {
          addUserFishById(web3.utils.toNumber(tokenId))
        });
      }
    } catch (error) {
      console.log("Error loading staked Breeding Fish tokens for account: ")
      console.log(error)
    }
  }

  const fetchBreedingFish = async (startIndex?: number) => {
    // console.log("Loading Breeding Fish")
    const breedingWatersAddress = FishFight.readBreedingWaters.options.address
    try {
      // console.log(startIndex)
      if(!startIndex) {
        startIndex = 0;
      }
      setLoadingFish(true);
      let breedingFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex, breedingWatersAddress, FishFight.readFishFactory.options.address).call()
      breedingFishIds = [...new Set(breedingFishIds)].filter((val) => {
        return val !== '0';
      });

      // console.log(breedingFishIds)
      await Promise.all(breedingFishIds.map(async tokenId => {
      // const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, index).call();
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!breedingFish.some(fish => fish.tokenId === parsedTokenId)) {
          await addBreedingFishById(parsedTokenId)
        }
        // setUserFishIndex(parsedTokenId);
      }));

      setBreedingFishIndex(breedingFishIds.length)
      setLoadingFish(false);
      // const fishBreedingWatersOwns = await FishFight.readFishFactory.methods.balanceOf(breedingWatersAddress).call();
      // console.log(`Fish in Breeding Waters: ${fishBreedingWatersOwns}`)
      // const numUserFish = web3.utils.toBN(fishBreedingWatersOwns).toNumber();
      // for(let i = 0; i < numUserFish; i++) {
      //   FishFight.readFishFactory.methods.tokenOfOwnerByIndex(breedingWatersAddress, i).call()
      //   .then((tokenId: any) => {
      //     // if(!userFish.some(fish => fish.tokenId == tokenId)) {
      //       addBreedingFishById(web3.utils.toNumber(tokenId))
      //     // }
      //   });
      // }
    } catch (error) {
      console.log("Error Breeding Fish: ")
      console.log(error)
    }
  }

  const createUserFish = async (tokenId: number) => {
    const fishData = await buildFish(FishFight, web3.utils.toNumber(tokenId))
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
      return fishData;
    }
    return null;
  };

  // const depositUserFightingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, true, false)
  //   setUserFightingFish(prevTokens => [...prevTokens, fishData != null ? fishData : fish])
  //   // Remove the fish from the UserFish array
  //   setUserFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  // };

  // When user withdraws a fish remove from UserFightingFish and FightingFish
  // Add back to UserFish
  // const withdrawUserFightingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, false)
  //   setUserFightingFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  //   removeFightingFishById(fish.tokenId);
  //   addUserFish(fishData != null ? fishData : fish);
  // }

  // const depositUserBreedingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, true)
  //   setUserBreedingFish(prevTokens => [...prevTokens, fishData != null ? fishData : fish])
  //   // Remove the fish from the UserFish array
  //   setUserFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  // };

  // When user withdraws a fish remove from UserBreedingFish and BreedingFish
  // Add back to UserFish
  // const withdrawUserBreedingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, false)
  //   setUserBreedingFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  //   removeBreedingFishById(fish.tokenId);
  //   addUserFish(fishData != null ? fishData : fish);
  // }

  // Remove Burned Fish from all Fish arrays
  const fishBurned = (tokenId: number) => {
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFishWeak(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setOceanFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const addUserFishById = async (tokenId: number) => {
    // console.log("Add Fish By Id")
    // const fishData = await getFish(FishFight, tokenId, false, false)
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = true;
      setUserFish(prevTokens => [...prevTokens, fishData])
      if(fightingFish.some(fish => fish.tokenId === tokenId)) {
        setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      } else if(breedingFish.some(fish => fish.tokenId === tokenId)) {
        setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      }
    }
  };

  const addFightingFishById = async (tokenId: number) => {
    // console.log("Add FightingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addFightingFishWeakById = async (tokenId: number) => {
    // console.log("Add FightingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFishWeak(prevTokens => [...prevTokens, fishData])
    }
  };

  const addBreedingFishById = async (tokenId: number) => {
    // console.log("Add BreedingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setBreedingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const removeFightingFishById = (tokenId: number) => {
    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeFightingFishWeakById = (tokenId: number) => {
    setFightingFishWeak(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeBreedingFishById = (tokenId: number) => {
    setBreedingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const refreshFish = async (tokenId: number, isFighting?: boolean, isBreeding?: boolean) =>  {
    const fishData = await buildFish(FishFight, tokenId);

    if(fishData == null) { // fish dies or no longer exists
      fishBurned(tokenId);
      return null;
    };

    if(userFish.some(fish => fish.tokenId === tokenId)) {
      fishData.isUser = true;
      setUserFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFish.some(fish => fish.tokenId === tokenId)) {
      setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFishWeak.some(fish => fish.tokenId === tokenId)) {
      setFightingFishWeak(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(breedingFish.some(fish => fish.tokenId === tokenId)) {
      setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(oceanFish.some(fish => fish.tokenId === tokenId)) {
      setOceanFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    return fishData;
  }


	const refreshLoadedFish = async () => {
    let allFish = userFish.concat(fightingFish).concat(breedingFish).concat(oceanFish);
    allFish = [...new Set(allFish)];
    setLoadingFish(true);
		await Promise.all(allFish.map(async (fish) => {
      await refreshFish(fish.tokenId)
    }));
    setLoadingFish(false);
	};

	const value: FishPoolProviderContext = {
		userFish: userFish,
    oceanFish: oceanFish,
    fightingFish: fightingFish,
    fightingFishWeak: fightingFishWeak,
    breedingFish: breedingFish,
    userFishIndex: userFishIndex,
    oceanFishIndex: oceanFishIndex,
    breedingFishIndex: breedingFishIndex,
    fightingFishIndex: fightingFishIndex,
    loadingFish: loadingFish,
    loadingUserFish: loadingUserFish,
    refreshFish: refreshFish,
    createUserFish: createUserFish,
    fetchOceanFish: fetchOceanFish,
    fetchUserFish: fetchUserFish,
    fetchFightingFish: fetchFightingFish,
    fetchBreedingFish: fetchBreedingFish,
    refreshLoadedFish: refreshLoadedFish,
    loadMoreFish: loadMoreFish,
	};

	return <FishPoolContext.Provider value={value}>{children}</FishPoolContext.Provider>;
};

// useFishFight
export const useFishPool = () => {
	const context = useContext(FishPoolContext);

	if (!context) {
		// eslint-disable-next-line no-throw-literal
		throw 'useFishFight must be used within a FishFightProvider';
	}
	return context;
};


// Utility Functions


// Gets Fish tokenURI from smart contract and loads the associated metadata from IPFS
// TODO: currently just returns imgSrc, will add mp4 src
const getFishMetaData = async (tokenURI: string) : Promise<string> => {
  let metadata = null;
  if(tokenURI != "") {
    try {
      const metadataResponse = await axios.get(tokenURI);
      metadata = metadataResponse.data.image;
    } catch (error) {
      console.log("Error in Axios call: ");
      console.log(error)
    }
  }
  return metadata;
}


const buildFish = async (fishFightInstance: FishFight, tokenId: number, isParent?: boolean) => {
  const contractCallContext: ContractCallContext[] = [
    {
      reference: 'fishFactory',
      contractAddress: Contracts.contracts.FishFactory.address,
      abi: Contracts.contracts.FishFactory.abi,
      calls: [{ reference: 'fishData', methodName: 'getFishInfo', methodParameters: [tokenId] },
      { reference: 'fishTokenUri', methodName: 'tokenURI', methodParameters: [tokenId] }
      ]
    },
    {
      reference: 'fishStats',
      contractAddress: fishFightInstance.readFishStats.options.address,
      abi: Contracts.contracts.FishStats.abi,
      calls: [{ reference: 'fishStats', methodName: 'getFishModifiers', methodParameters: [tokenId] },
      { reference: 'fishFights', methodName: 'getFishFights', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWaters',
      contractAddress: fishFightInstance.readFightingWaters.options.address,
      abi: Contracts.contracts.FightingWaters.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWatersWeak',
      contractAddress: fishFightInstance.readFightingWatersWeak.options.address,
      abi: Contracts.contracts.FightingWatersWeak.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'breedingWaters',
      contractAddress: fishFightInstance.readBreedingWaters.options.address,
      abi: Contracts.contracts.BreedingWaters.abi,
      calls: [{ reference: 'fishStakedBreedData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    }
  ];



  const results: ContractCallResults = await fishFightInstance.multicall.call(contractCallContext);
  // console.log(results)
  const fishFactoryGetFishInfo = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues : null;
  const fishFactoryTokenUri = results.results.fishFactory.callsReturnContext[1].success ? results.results.fishFactory.callsReturnContext[1].returnValues[0] : null;
  // console.log(fishFactoryTokenUri)
  let imgSrc = null;
  if(fishFactoryTokenUri) {
    imgSrc = `${fishFactoryTokenUri}.png`
  }
  const fishStatsGetFishModifiers = results.results.fishStats.callsReturnContext[0].success ? results.results.fishStats.callsReturnContext[0].returnValues : null;
  const fishStatsGetFights = results.results.fishStats.callsReturnContext[1].success ? results.results.fishStats.callsReturnContext[1].returnValues : null;
  const fightingWatersGetPoolInfo = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues : null;
  const fightingWatersWeakGetPoolInfo = results.results.fightingWatersWeak.callsReturnContext[0].success ? results.results.fightingWatersWeak.callsReturnContext[0].returnValues : null;
  const breedingWatersGetPoolInfo = results.results.breedingWaters.callsReturnContext[0].success ? results.results.breedingWaters.callsReturnContext[0].returnValues : null;
  // console.log(results);

  if(fishFactoryGetFishInfo == null) return null;
  let fishInfo = {
    tokenId: fishFactoryGetFishInfo[0].hex,
    birthTime: fishFactoryGetFishInfo[1].hex,
    parentA: fishFactoryGetFishInfo[2].hex,
    parentB: fishFactoryGetFishInfo[3].hex,
    deathTime: fishFactoryGetFishInfo[4].hex,
    revived: fishFactoryGetFishInfo[5],
    generation: fishFactoryGetFishInfo[6],
    lifetimeWins: fishFactoryGetFishInfo[7],
    strength: fishFactoryGetFishInfo[8],
    intelligence: fishFactoryGetFishInfo[9],
    agility: fishFactoryGetFishInfo[10],
    fishType: fishFactoryGetFishInfo[11],
    rarity: fishFactoryGetFishInfo[12],
    genes: fishFactoryGetFishInfo[13],
    breedKey: fishFactoryGetFishInfo[14],
    offspring: fishFactoryGetFishInfo[15],
    ipfsLink: fishFactoryTokenUri
  }
  // console.log(fishInfo)
  if(fishStatsGetFishModifiers == null) return null;

  const fish = new Fish(fishInfo, fishStatsGetFishModifiers, imgSrc, fishFactoryTokenUri)

  if(fightingWatersGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersGetPoolInfo[2].hex),
      poolType: 0
    }
  }
  if(fightingWatersWeakGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersWeakGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersWeakGetPoolInfo[2].hex),
      poolType: 1
    }
  }
  if(breedingWatersGetPoolInfo != null) {
    fish.stakedBreeding = {
      earnedFishFood: web3.utils.fromWei(breedingWatersGetPoolInfo[0].hex),
    }
  }
  // if(fishStatsGetFights != null) {

  //   const deathFightData = await Promise.all(fishStatsGetFights.map(async fight => {
  //     console.log(fight)
  //     const fightId = web3.utils.toNumber(fight[1].hex);
  //     console.log(fightId)
  //     const result = await fishFightInstance.readFightComputation.methods.getFightInfo(fightId).call();
  //     const fightHistory = {
  //       address: fight[0],
  //       fightId: fightId,
  //       result: result
  //     }
  //     return fightHistory
  //   }))
  //   fish.fightingHistory = deathFightData;
  // }

  if(fish.parentA > 0 && !isParent) {
    fish.parentAFish = await buildFish(fishFightInstance, fish.parentA, true);
    fish.parentBFish = await buildFish(fishFightInstance, fish.parentB, true);
  }
  // console.log(fish)

  return fish;
}


// const getParentFish = async (fishFightInstance: FishFight, tokenId: number) => {
//   const fishInfo = await fishFightInstance.readFishFactory.methods.getFishInfo(tokenId).call();
//   let fish = new Fish(
//     fishInfo,
//     null,
//     null,
//     null,
//     null,
//   );
//   return fish;
// }
