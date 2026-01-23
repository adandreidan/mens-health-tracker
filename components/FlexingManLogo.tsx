import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface FlexingManLogoProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

export default function FlexingManLogo({ 
  size = 120, 
  style,
  color = '#000000' 
}: FlexingManLogoProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Head */}
        <Circle cx="100" cy="35" r="20" fill={color} />
        
        {/* Neck */}
        <Path
          d="M 95 55 L 95 65 L 105 65 L 105 55 Z"
          fill={color}
        />
        
        {/* Body - Torso with defined muscles */}
        <Path
          d="M 100 65 L 82 105 L 100 125 L 118 105 Z"
          fill={color}
        />
        
        {/* Left Arm - Flexed upward (classic flex pose) */}
        <G>
          {/* Upper arm - bicep flexed */}
          <Path
            d="M 82 75 Q 55 80 42 95"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bicep bulge */}
          <Circle cx="60" cy="82" r="8" fill={color} />
          {/* Shoulder cap */}
          <Circle cx="82" cy="75" r="7" fill={color} />
          {/* Forearm */}
          <Path
            d="M 42 95 Q 38 105 42 115"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hand - clenched fist */}
          <Circle cx="42" cy="120" r="6" fill={color} />
        </G>
        
        {/* Right Arm - Flexed upward (classic flex pose) */}
        <G>
          {/* Upper arm - bicep flexed */}
          <Path
            d="M 118 75 Q 145 80 158 95"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bicep bulge */}
          <Circle cx="140" cy="82" r="8" fill={color} />
          {/* Shoulder cap */}
          <Circle cx="118" cy="75" r="7" fill={color} />
          {/* Forearm */}
          <Path
            d="M 158 95 Q 162 105 158 115"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hand - clenched fist */}
          <Circle cx="158" cy="120" r="6" fill={color} />
        </G>
        
        {/* Chest muscles - Pectoral definition */}
        <Path
          d="M 88 70 Q 100 75 112 70"
          stroke={color}
          strokeWidth="4"
          fill="none"
        />
        
        {/* Abs - Six-pack definition */}
        <Path
          d="M 90 88 L 90 98 M 95 88 L 95 98 M 100 88 L 100 98 M 105 88 L 105 98 M 110 88 L 110 98"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Horizontal ab lines */}
        <Path
          d="M 90 88 L 110 88 M 90 93 L 110 93 M 90 98 L 110 98"
          stroke={color}
          strokeWidth="2"
        />
        
        {/* Left Leg */}
        <Path
          d="M 95 125 L 88 165"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left calf muscle */}
        <Circle cx="90" cy="145" r="5" fill={color} />
        {/* Left Foot */}
        <Path
          d="M 88 165 L 78 170 L 83 175"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Right Leg */}
        <Path
          d="M 105 125 L 112 165"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right calf muscle */}
        <Circle cx="110" cy="145" r="5" fill={color} />
        {/* Right Foot */}
        <Path
          d="M 112 165 L 122 170 L 117 175"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

