import React from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withSafeArea?: boolean;
  padding?: boolean;
}

export function ScreenContainer({
  children,
  scrollable = true,
  withSafeArea = true,
  padding = true,
}: ScreenContainerProps) {
  const containerClass = `flex-1 bg-slate-50 ${padding ? 'p-4' : ''}`;

  const InnerContainer = scrollable ? ScrollView : View;
  const wrapperProps = scrollable ? { showsVerticalScrollIndicator: false } : {};

  const content = (
    <InnerContainer className={containerClass} {...wrapperProps}>
      {children}
    </InnerContainer>
  );

  const keyboardView = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  );

  if (withSafeArea) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        {keyboardView}
      </SafeAreaView>
    );
  }

  return <View className="flex-1 bg-slate-50">{keyboardView}</View>;
}

export default ScreenContainer;
