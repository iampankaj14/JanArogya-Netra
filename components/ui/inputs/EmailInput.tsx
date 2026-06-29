import React from 'react';
import TextInput, { TextInputProps } from './TextInput';

export function EmailInput(props: Omit<TextInputProps, 'keyboardType' | 'leftIcon' | 'autoCapitalize'>) {
  return (
    <TextInput
      keyboardType="email-address"
      autoCapitalize="none"
      leftIcon="email"
      {...props}
    />
  );
}

export default EmailInput;
