import React, { useState } from 'react';
import TextInput, { TextInputProps } from './TextInput';

export function PasswordInput(props: Omit<TextInputProps, 'secureTextEntry' | 'rightIcon' | 'onRightIconPress'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      secureTextEntry={!showPassword}
      rightIcon={showPassword ? 'eyeOff' : 'eye'}
      onRightIconPress={() => setShowPassword(!showPassword)}
      leftIcon="lock"
      {...props}
    />
  );
}

export default PasswordInput;
