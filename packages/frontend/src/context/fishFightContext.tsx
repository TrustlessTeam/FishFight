// FishFightSDK
import FishFight from "../FishFightSDK";

// React
import { createContext, useContext, useEffect, useState } from "react"

// Utils
import { getProvider } from '../utils/provider'

// Web3React
import { useWeb3React } from "@web3-react/core";

// Helpers
import { getHarmonyProvider, getWalletProvider } from '../helpers/providerHelper'

interface FishFightProviderContext {
    FishFight: FishFight;
    balance: string | undefined;
}

type FishFightProviderProps = { children: React.ReactNode }


const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight(getHarmonyProvider().provider, getHarmonyProvider().type))
  const { active, connector, library} = useWeb3React();
  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (active && connector && library) {
      getWalletProvider(connector, library).then((wallet) => setFishFightInstance(new FishFight(wallet.provider, wallet.type)))
    }
  }, [connector, library])

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    balance: undefined,
  }
  return (
      <FishFightContext.Provider value={value}>{children}</FishFightContext.Provider>
  )
}

// useFishFight
export const useFishFight = () => {
    const context = useContext(FishFightContext)

    if(!context) {
        throw 'useFishFight must be used within a FishFightProvider';
    }
    return context
}