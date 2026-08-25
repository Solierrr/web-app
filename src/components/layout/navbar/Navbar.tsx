import { Link } from "react-router-dom";

function Navbar() {
    return (
        <header className="w-full">
            <Link to={"/"} content="Olá" />
        </header>
    );
}

export default Navbar;