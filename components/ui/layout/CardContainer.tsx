import React from 'react';
import { View } from 'react-native';

interface CardContainerProps {
  children: React.ReactNode;
  row?: boolean;
}

export function CardContainer({
  children,
  row = false,
}: CardContainerProps) {
  const containerClass = `gap-4 ${row ? 'flex-row' : 'flex-col'}`;

  return (
    <View className={containerClass}>
      {children}
    </View>
  );
}

export default CardContainer;
