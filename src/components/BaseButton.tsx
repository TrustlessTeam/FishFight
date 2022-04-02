import { BaseButtonStyle } from "./BaseStyles";
import useSound from 'use-sound';

import { useFishFight } from "../context/fishFightContext";

type Props = {
  onClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: object;
  className?: string; 
}



const BaseButton = ({onClick, children, style, disabled, className} : Props) => {
  const [playClick] = useSound('click.wav', {volume: 0.25});
  
  const { globalMute } = useFishFight();



  return (
    <BaseButtonStyle
      onClick={() => 
        {
          onClick(); 
          if (!globalMute)
          { playClick();}
        }
      }
      disabled={disabled}
      style={style}
      className={className}
    >
      {children}
    </BaseButtonStyle>
  );
};

export default BaseButton;