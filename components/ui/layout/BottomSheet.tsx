import React from 'react';
import { Modal as RNModal, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        {/* Backdrop close area */}
        <Pressable className="flex-1" onPress={onClose} />
        
        {/* Sheet Content container */}
        <View className="bg-white rounded-t-3xl border-t border-slate-100 max-h-[85%] pb-8 shadow-2xl">
          {/* Header indicator bar */}
          <View className="w-12 h-1 bg-slate-200 rounded-full mx-auto my-3" />

          {/* Header row */}
          <View className="flex-row justify-between items-center px-5 pb-3 border-b border-slate-50">
            <Text className="text-slate-800 font-bold text-lg flex-1 mr-4" numberOfLines={1}>
              {title || 'Option Menu'}
            </Text>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center bg-slate-50 active:bg-slate-100"
            >
              <Feather name="x" size={16} color="#4B5563" />
            </Pressable>
          </View>

          {/* Scrollable / Static Body */}
          <View className="px-5 pt-4">
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export default BottomSheet;
