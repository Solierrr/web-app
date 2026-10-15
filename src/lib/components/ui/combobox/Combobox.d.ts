export interface ComboboxProps {
  name: string;
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
  emptyLabel: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
  errorId?: string;
  selectionLabel?: boolean;
  toggleLabel?: string;
  disabled?: boolean;
  normalize?: (value: string) => string;
}
