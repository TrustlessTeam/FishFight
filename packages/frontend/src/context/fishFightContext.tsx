// FishFightSDK
import FishFight from "../FishFightSDK";

// React
import { createContext, useContext } from "react"

// Utils
import { getProvider } from '../utils/provider'

interface FishFightProviderContext {
    FishFight: FishFight;
    balance: string | undefined;
    // fetchBalance: (account: string) => Promise<void>;
    // resetBalance: () => void;
    // isConnected: boolean;
    // address: string;
}

type FishFightProviderProps = { children: React.ReactNode}


const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  const FishFightInstance = new FishFight(getProvider())
    
  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    balance: undefined
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