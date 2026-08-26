import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";

export default function Navbar() {
    const { t } = useTranslation("commons", { keyPrefix: "navbar" });

    return (
        <header className="w-full">
            <div className="flex flex-row gap-8 w-full py-5.5 items-center justify-center *:font-semi-bold">
                <Link to={"/"}>{t("app")}</Link>
                <Link to={"/"}>{t("solarPanels")}</Link>
                <Link to={"/"}>{t("professionals")}</Link>
                <Link to={"/"}>{t("accredit")}</Link>
                <Link to={"/"}>{t("support")}</Link>
                <Link to={"/"}><Icon name="search" /></Link>
                <Link to={"/"}><Icon name="shoppingCart" /></Link>
                <LanguageSwitcher />
            </div>
        </header>
    );
}
