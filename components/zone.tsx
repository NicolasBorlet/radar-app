import { Marker } from 'react-native-maps';
import Svg, { Circle } from 'react-native-svg';

interface ZoneSvgProps {
  latitude: number;
  longitude: number;
  delta: number;
}

export default function ZoneSvg({ latitude, longitude, delta }: ZoneSvgProps) {
  // Calculate size based on zoom level (delta)
  // When delta is large (zoomed out), size is smaller
  // When delta is small (zoomed in), size is larger
  const baseSize = 30;
  const maxSize = baseSize * 2; // 200% of base size
  const minSize = baseSize * 0.5; // 50% of base size

  // Delta ranges from about 0.01 (very zoomed in) to about 50 (whole country)
  const size = Math.max(
    minSize,
    Math.min(
      maxSize,
      baseSize * (1 / Math.sqrt(delta))
    )
  );

  const radius = size / 3;

  return (
    <Marker coordinate={{ latitude, longitude }}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="rgba(0, 128, 0, 0.3)"
          strokeWidth="2"
          fill="rgba(0, 255, 0, 0.2)"
        />
      </Svg>
    </Marker>
  );
}