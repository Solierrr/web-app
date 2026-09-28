import { useTranslation } from "react-i18next";


interface LogoProps {
    width?: number;
    className?: string;
}

export default function Logo({ width = 3, className }: LogoProps) {
    const { t } = useTranslation("branding");

    return (
        <img src="/snowflake.svg" className={`h-fit aspect-square ${className}`} style={{ width: `${width}rem` }} alt={t("")} />
    );
}