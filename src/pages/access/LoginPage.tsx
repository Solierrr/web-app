import { Link } from "react-router-dom"
import Access from "@/components/access/Access"

export default function LoginPage() {
    return (
        <Access
            heading="Solaria"
            helperText={<>Não encontrou sua empresa? <Link to="/" className="text-hyperlink">Contatar o suporte</Link></>}
            fields={[
                { name: "email", type: "email", placeholder: "seuemailaqui@email.com" },
                { name: "password", placeholder: "suasenhaaqui", password: true },
            ]}
            submitLabel="Prosseguir"
            footer={
                <div className="flex flex-col gap-2">
                    <Link to="/esqueci-senha" className="text-hyperlink">Esqueci minha senha</Link>
                    <p>Não tem uma conta? <Link to="/cadastro" className="text-hyperlink">Cadastre-se</Link></p>
                </div>
            }
        />
    )
}
