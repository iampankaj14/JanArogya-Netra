import React from 'react';
import { Modal as RNModal, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-6">
        {/* Backdrop close area */}
        <Pressable className="absolute top-0 bottom-0 left-0 right-0" onPress={onClose} />

        {/* Modal body card */}
        <View className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden z-10">
          {/* Header Row */}
          <View className="flex-row justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-100">
            <Text className="text-slate-800 font-bold text-base flex-1 mr-4" numberOfLines={1}>
              {title || 'Dialog'}
            </Text>
            <Pressable
              onPress={onClose}
              className="w-7 h-7 rounded-full items-center justify-center bg-white border border-slate-100 active:bg-slate-50"
            >
              <Feather name="x" size={14} color="#4B5563" />
            </Pressable>
          </View>

          {/* Modal Content */}
          <View className="p-4">
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

export default Modal;
