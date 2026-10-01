interface ContainerProps {
  children: React.ReactNode;
  ptop?: boolean;
  className?: string;
}

export default function WrapperLayout({ children, ptop = false, className = "" }: ContainerProps) {
  return <main className={`mx-auto w-full xl:px-50 lg:px-40 md:px-20 sm:px-10 ${ptop ? "pt-10" : ""} ${className}`}>{children}</main>;
}
