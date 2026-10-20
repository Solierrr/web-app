export interface BrandSelectProps {
  value: string;
  label: string;
  selectedName?: string;
  invalid?: boolean;
  errorId?: string;
  presentation?: "popover" | "dialog";
  onChange: (id: string, name: string) => void;
}
