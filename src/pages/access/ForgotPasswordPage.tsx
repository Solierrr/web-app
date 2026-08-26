import { Link } from "react-router-dom"
import Access from "@/components/access/Access"

export default function ForgotPasswordPage() {
    return (
        <Access
            heading="Solaria"
            helperText="Informe seu e-mail para receber as instruções de recuperação"
            fields={[
                { name: "email", type: "email", placeholder: "seuemailaqui@email.com" },
            ]}
            submitLabel="Enviar"
            footer={<p>Lembrou a senha? <Link to="/login" className="text-hyperlink">Voltar para o login</Link></p>}
        />
    )
}
