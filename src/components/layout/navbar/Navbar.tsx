import { Link } from "react-router-dom";
import Icon from "@@/ui/icon/Icon";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";

export default function Navbar() {
    return (
        <header className="w-full">
            <div className="flex flex-row gap-8 w-full py-5.5 items-center justify-center *:font-semi-bold">
                <Link to={"/"}>Aplicativo</Link>
                <Link to={"/"}>Placas Solares</Link>
                <Link to={"/"}>Profissionais</Link>
                <Link to={"/"}>Credenciar-se</Link>
                <Link to={"/"}>Suporte</Link>
                <Link to={"/"}><Icon name="search" /></Link>
                <Link to={"/"}><Icon name="shoppingCart" /></Link>
                <LanguageSwitcher />
            </div>
        </header>
    );
}
