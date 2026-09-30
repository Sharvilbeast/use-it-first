import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const PantryIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16v16H4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 10h16M10 4v16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const FridgeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="5" y1="10" x2="19" y2="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="5" x2="8" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="13" x2="8" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const FreezerIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v20M17 5H7M19 12H5M17 19H7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 3l3 2 3-2M9 21l3-2 3 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CameraIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChefIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="6" y1="17" x2="18" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BarcodeIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="5" x2="3" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="7" y1="5" x2="7" y2="19" stroke={color} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
    <Line x1="11" y1="5" x2="11" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14" y1="5" x2="14" y2="19" stroke={color} strokeWidth={strokeWidth * 0.75} strokeLinecap="round" />
    <Line x1="18" y1="5" x2="18" y2="19" stroke={color} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
    <Line x1="21" y1="5" x2="21" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MilkIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 2h8v4H8zM6 6h12l1 16H5L6 6z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const VeggieIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a9 9 0 0 1 9 9c0 5-4 9-9 9s-9-4-9-9a9 9 0 0 1 9-9z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 6v14M8 10c2 2 4 2 4 2M16 10c-2 2-4 2-4 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const BreadIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11a8 8 0 0 1 16 0v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11c0-2.5 1-4 2-4s2 1.5 2 4M13 11c0-2.5 1-4 2-4s2 1.5 2 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MeatIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 5c-3-3-8-1-11 2s-5 8-2 11 8 1 11-2 5-8 2-11z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="10" cy="14" r="2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const CanIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="5" width="12" height="15" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="6" y1="9" x2="18" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="6" y1="16" x2="18" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const AlertIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const SavingsIcon: React.FC<IconProps> = ({ size = 18, color = 'currentColor', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
