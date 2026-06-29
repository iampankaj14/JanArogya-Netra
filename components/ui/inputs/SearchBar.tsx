import React from 'react';
import TextInput, { TextInputProps } from './TextInput';

interface SearchBarProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  onClear?: () => void;
  value: string;
}

export function SearchBar({
  value,
  onClear,
  ...props
}: SearchBarProps) {
  return (
    <TextInput
      value={value}
      leftIcon="search"
      rightIcon={value ? 'x' : undefined}
      onRightIconPress={onClear}
      {...props}
    />
  );
}

export default SearchBar;
