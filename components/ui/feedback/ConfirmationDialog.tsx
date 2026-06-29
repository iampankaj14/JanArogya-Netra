import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Modal from '../layout/Modal';

interface ConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function ConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
}: ConfirmationDialogProps) {
  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <Text className="text-slate-650 text-sm mb-6 leading-5">
        {message}
      </Text>
      
      <View className="flex-row justify-end gap-3">
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
          className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white"
        >
          <Text className="text-slate-600 font-bold text-sm">{cancelLabel}</Text>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          className={`px-5 py-2.5 rounded-lg ${isDanger ? 'bg-red-600' : 'bg-blue-900'}`}
        >
          <Text className="text-white font-bold text-sm">{confirmLabel}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default ConfirmationDialog;
