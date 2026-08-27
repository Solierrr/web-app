import { Link } from "react-router-dom";
import Access from "@/components/access/Access";

export default function RegisterPage() {
    return (
        <Access
            heading="Solaria"
            helperText="Crie sua conta para acessar o marketplace"
            fields={[
                { name: "name", placeholder: "seunomeaqui" },
                { name: "email", type: "email", placeholder: "seuemailaqui@email.com" },
                { name: "password", placeholder: "suasenhaaqui", password: true },
                { name: "confirmPassword", placeholder: "confirmesuasenha", password: true },
            ]}
            submitLabel="Cadastrar"
            footer={<p>Já tem uma conta? <Link to="/login" className="text-hyperlink">Entrar</Link></p>}
        />
    );
}
