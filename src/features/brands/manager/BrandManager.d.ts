import type { Brand } from "../brand";
export interface BrandManagerProps {
  brands: Brand[];
  initialBrandId?: string;
  onSaved: (b?: Brand) => Promise<void>;
  onClose: () => void;
}
