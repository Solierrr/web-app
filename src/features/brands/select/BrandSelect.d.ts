export interface BrandSelectProps {
  value: string;
  label: string;
  selectedName?: string;
  invalid?: boolean;
  errorId?: string;
  onChange: (id: string, name: string) => void;
}
