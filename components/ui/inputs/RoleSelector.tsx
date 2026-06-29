import React from 'react';
import Dropdown from './Dropdown';
import { roles, UserRole } from '@/constants/roles';

interface RoleSelectorProps {
  selectedValue?: UserRole;
  onValueChange: (value: UserRole) => void;
  error?: string;
  label?: string;
}

export function RoleSelector({
  selectedValue,
  onValueChange,
  error,
  label = 'Select User Role',
}: RoleSelectorProps) {
  const options = Object.entries(roles).map(([key, label]) => ({
    label: label as string,
    value: key,
  }));

  return (
    <Dropdown
      label={label}
      placeholder="Select role"
      options={options}
      selectedValue={selectedValue}
      onValueChange={(val) => onValueChange(val as UserRole)}
      error={error}
    />
  );
}

export default RoleSelector;
