# Component Usage Registry

This registry documents where every reusable UI component is consumed, their properties, triggers, and dependencies.

---

## 🔘 Buttons (`components/ui/buttons/`)

### `PrimaryButton`, `SecondaryButton`, `DangerButton`, `OutlineButton`
- **Used In**:
  - `Login` (Submit credentials)
  - `Profile` (Log out action)
  - `PHC Detail` (Initiate redistribution)
  - `Resource Redistribution` (Submit transfer request)
- **Props**:
  - `title: string` (Button text)
  - `loading?: boolean` (Triggers spinner overlay)
  - `disabled?: boolean` (Prevents press actions)
  - `leftIcon?: AppIconName` / `rightIcon?: AppIconName` (Displays icon)
- **Events**:
  - `onPress: () => void` (Click callback)
- **Dependencies**: `@expo/vector-icons/Feather`, `constants/icons`

### `IconButton`
- **Used In**:
  - `PageHeader` (Back button)
  - `Netra AI Assistant` (Send message)
- **Props**:
  - `icon: AppIconName` (Feather icon identifier)
  - `size?: number` (Visual bounds size)
  - `variant?: 'primary' | 'secondary' | 'transparent'`
- **Events**:
  - `onPress: () => void`

### `FloatingActionButton`
- **Used In**:
  - `Mission Control` (Quick launch Netra chat)
- **Props**:
  - `icon: AppIconName`
  - `label?: string`

---

## 📇 Cards (`components/ui/cards/`)

### `AlertCard`
- **Used In**:
  - `Mission Control` (Active alarms list)
  - `Command Queue` (Shortage tracking)
- **Props**:
  - `title: string`, `type: string`, `priority: AlertPriority`, `date: Date | string`, `description: string`
- **Events**:
  - `onPress?: () => void`

### `AIRecommendationCard`
- **Used In**:
  - `Mission Control` (Active AI suggestion panel)
- **Props**:
  - `title: string`, `sourceFacility: string`, `targetFacility: string`, `item: string`, `quantity: number`, `confidence: number`, `reasoning: string`
- **Events**:
  - `onApprove: () => void`
  - `onDecline: () => void`

### `PHCCard`
- **Used In**:
  - `PHCs List` (Facilities directory)
  - `District Map` (Preview overlays)
- **Props**:
  - `name: string`, `block: string`, `healthScore: number`, `doctorAvailable: boolean`, `stockStatus: 'adequate' | 'warning' | 'critical'`, `activeAlertsCount: number`

---

## 🎛️ Inputs (`components/ui/inputs/`)

### `TextInput`, `PasswordInput`, `EmailInput`
- **Used In**:
  - `Login` (Email, password forms)
  - `Resource Redistribution` (Quantity inputs)
  - `Netra AI Assistant` (Prompt inputs)
- **Props**:
  - `label?: string`, `error?: string`, `helperText?: string`, `leftIcon?: AppIconName`

### `Dropdown`, `RoleSelector`
- **Used In**:
  - `Login` (Role selections)
  - `Resource Redistribution` (Source and Target PHC selections)
- **Props**:
  - `options: Array<{ label: string, value: string }>`, `selectedValue?: string`
- **Events**:
  - `onValueChange: (value: string) => void`
- **Dependencies**: `components/ui/layout/BottomSheet`

---

## 🖼️ Overlays & Layouts (`components/ui/layout/`)

### `BottomSheet`
- **Used In**:
  - `Dropdown` (Display selection options)
  - `Scenario Simulator` (Parameters inputs panel)
- **Props**:
  - `visible: boolean`, `title?: string`
- **Events**:
  - `onClose: () => void`

### `Modal`
- **Used In**:
  - `ConfirmationDialog` (Wraps confirm overlays)
  - `PHC Detail` (Edit inventory overlay)
- **Props**:
  - `visible: boolean`, `title?: string`
- **Events**:
  - `onClose: () => void`
