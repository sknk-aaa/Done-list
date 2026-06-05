import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { color as C } from '@/theme/tokens';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const stroke = (sw: number) => ({
  fill: 'none' as const,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const Funnel = ({ size = 26, color = C.teal, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </Svg>
);

export const Hamburger = ({ size = 28, color = '#3A3F44', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Line x1="3" y1="7" x2="21" y2="7" />
    <Line x1="3" y1="12" x2="21" y2="12" />
    <Line x1="3" y1="17" x2="21" y2="17" />
  </Svg>
);

export const Check = ({ size = 18, color = C.teal, strokeWidth = 3.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polyline points="4 12.5 10 18 20 6" />
  </Svg>
);

export const Plus = ({ size = 30, color = C.white, strokeWidth = 2.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const TagFilled = ({ size = 13, color = C.muted }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M2 11.5V4a2 2 0 0 1 2-2h7.5c.5 0 1 .2 1.4.6l8.5 8.5a2 2 0 0 1 0 2.8l-7.5 7.5a2 2 0 0 1-2.8 0L2.6 12.9A2 2 0 0 1 2 11.5Zm5-5.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
  </Svg>
);

export const Note = ({ size = 13, color = '#B3B8BD', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Rect x="4" y="3" width="16" height="18" rx="2" />
    <Line x1="8" y1="8" x2="16" y2="8" />
    <Line x1="8" y1="12" x2="16" y2="12" />
    <Line x1="8" y1="16" x2="13" y2="16" />
  </Svg>
);

export const Calendar = ({ size = 20, color = '#8A8F94', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Rect x="3" y="5" width="18" height="16" rx="3" />
    <Line x1="3" y1="10" x2="21" y2="10" />
    <Line x1="8" y1="3" x2="8" y2="6" />
    <Line x1="16" y1="3" x2="16" y2="6" />
  </Svg>
);

export const Bell = ({ size = 12, color = C.teal, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const Clock = ({ size = 18, color = C.muted, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Circle cx="12" cy="12" r="9" />
    <Polyline points="12 7 12 12 15.5 14" />
  </Svg>
);

export const ChevronRight = ({ size = 18, color = C.chevron, strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polyline points="9 5 16 12 9 19" />
  </Svg>
);

export const ChevronLeft = ({ size = 22, color = C.teal, strokeWidth = 2.4 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polyline points="15 5 8 12 15 19" />
  </Svg>
);

export const ChevronDown = ({ size = 18, color = '#B0B5B9', strokeWidth = 2.2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const TabDaily = ({ size = 24, color = C.muted, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Rect x="3" y="4" width="18" height="17" rx="3" />
    <Line x1="3" y1="9" x2="21" y2="9" />
    <Line x1="8" y1="2" x2="8" y2="5" />
    <Line x1="16" y1="2" x2="16" y2="5" />
  </Svg>
);

export const TabMonth = ({ size = 24, color = C.muted, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Rect x="3" y="4" width="18" height="17" rx="3" />
    <Line x1="3" y1="9" x2="21" y2="9" />
    <Line x1="9" y1="9" x2="9" y2="21" />
    <Line x1="15" y1="9" x2="15" y2="21" />
    <Line x1="3" y1="15" x2="21" y2="15" />
  </Svg>
);

export const Compass = ({ size = 22, color = '#8A9097', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Circle cx="12" cy="12" r="9" />
    <Polygon points="15.5 8.5 10.5 10.5 8.5 15.5 13.5 13.5" />
  </Svg>
);

export const Question = ({ size = 22, color = '#8A9097', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Circle cx="12" cy="12" r="9" />
    <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" />
    <Line x1="12" y1="16.6" x2="12" y2="16.7" />
  </Svg>
);

export const Chat = ({ size = 22, color = '#8A9097', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.3-4.4A8.5 8.5 0 1 1 21 11.5Z" />
  </Svg>
);

export const Star = ({ size = 22, color = '#8A9097', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Polygon points="12 3 14.6 8.6 20.8 9.3 16.2 13.4 17.5 19.5 12 16.3 6.5 19.5 7.8 13.4 3.2 9.3 9.4 8.6" />
  </Svg>
);

export const ProSpark = ({ size = 22, color = C.teal, strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Path d="M3 17l3-9 4 5 4-7 4 7 3-5-2 9z" />
  </Svg>
);

export const PlayCircle = ({ size = 22, color = '#8A9097', strokeWidth = 2 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} {...stroke(strokeWidth)}>
    <Circle cx="12" cy="12" r="9" />
    <Polygon points="10 8.5 16 12 10 15.5" fill={color} stroke="none" />
  </Svg>
);
