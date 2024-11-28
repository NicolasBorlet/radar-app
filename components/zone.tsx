import { Marker } from 'react-native-maps';
import Svg, { Circle } from 'react-native-svg';

interface ZoneSvgProps {
  latitude: number;
  longitude: number;
}

export default function ZoneSvg({ latitude, longitude }: ZoneSvgProps) {
  return (
    <Marker coordinate={{ latitude, longitude }}>
      <Svg height="30" width="30" viewBox="0 0 30 30">
        <Circle 
          cx="15" 
          cy="15" 
          r="10" 
          stroke="rgba(0, 128, 0, 0.3)" 
          strokeWidth="2" 
          fill="rgba(0, 255, 0, 0.2)" 
        />
      </Svg>
    </Marker>
  );
}