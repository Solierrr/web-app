import LogoLoader from "@@/feedback/logo-loader/LogoLoader";

interface LoadingProps {
  label?: string;
  className?: string;
}

export default function Loading({ label, className }: LoadingProps) {
  return (
    <div className={`fixed inset-0 z-50 flex bg-white ${className ?? ""}`}>
      <LogoLoader label={label} />
    </div>
  );
}
