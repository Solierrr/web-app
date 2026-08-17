import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanel"
import { getSolarPanel } from "@/service/solarPanel";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";


function regionsService(regions: string[]): string {
    if (!regions) { return "Entre em contato para" }
    
    let result = "";
    if      (regions.length == 1) result = regions[0];
    else if (regions.length == 2) result = `${regions[0]} e ${regions[1]}`;
    else if (regions.length  > 2) result = `${regions[0]}, ${regions[1]} e ${regions[2]}`;

    return `Atendimento em ${result}`;
}

interface WrapperProps extends React.ComponentPropsWithoutRef<"section"> {
    title:    string;
    children: React.ReactNode;

    className?: string;
}

function Wrapper({ title, children, className }: WrapperProps) {
    return (
        <section className={`${className}`}>
            <h2>{title}</h2>
            {children}
        </section>
    );
}

export default function SolarPanelAnnouncement() {
    const { id } = useParams<{ id: string }>();
    
    if (!id) { return <div>Produto não encontrado</div>; }

    const product = getSolarPanel(id)

    return (
        <div>
            <div>
                <img src="" alt="" />
                <section>
                    <div>
                        <div>
                            <h1>{product.title}</h1>
                            <h2>{regionsService(product.serviceRegions)}</h2>
                        </div>
                        <div>
                            <div className="flex">
                                <div>
                                    <h1>{product.discountPercentage} %</h1>
                                    <span>
                                        <sub>R$</sub>
                                        <h2>{product.unitPrice} / unidade</h2>
                                    </span>
                                </div>
                                <h2>{product.availableUnits} unidades</h2>
                            </div>
                            <div className="flex">
                                <Button content="Entrar em contato" description="Entrar em contato com o fornecedor" rounded/>
                                <Button description="Adicionar ao carrinho" icon={{ name: "shopping-cart" }}/>
                            </div>
                        </div>
                    </div>
                </section>
                <Wrapper title="Descrição"       aria-labelledby="Descrição"       children={<p>{product.description}</p>} />
                <Wrapper title="Características" aria-labelledby="Características" children={<p>{product.description}</p>} />
                <Wrapper title="Detalhes"        aria-labelledby="Detalhes"        children={<p>{product.description}</p>} />
                <Wrapper title="Detalhes"        aria-labelledby="Detalhes"        children={<p>{product.description}</p>} />
            </div>
            <Wrapper title="Detalhes" aria-labelledby="Detalhes" children={<p>{product.description}</p>} />
        </div>
    )
}