import { PressableProps } from 'react-native';
import { AppIconName } from '@/constants/icons';

export interface BaseButtonProps extends PressableProps {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: AppIconName;
  rightIcon?: AppIconName;
}
export default BaseButtonProps;
