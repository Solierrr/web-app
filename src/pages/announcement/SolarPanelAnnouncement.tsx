import { useParams }          from "react-router-dom";
import { useEffect, useState } from "react";

import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanel"
import type { SolarPanel }             from "@/domain/models/products/solarPanel"
import type { Image }                  from "@/domain/models/shared/image";

import { getSolarPanel }   from "@/service/feed/solarPanel.service";
import Button              from "@@/ui/button/Button"
import { LightIconButton } from "@@/ui/button/Button.presets";
import { useContextMenu }  from "@/config/contextMenu/useContextMenu";


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
        <section className={`flex flex-col gap-2 ${className}`}>
            <h2 className="text-black/90">{title}</h2>
            {children}
        </section>
    );
}

interface ImagesProps {
    images: Image[];
}

function ProductImages({ images }: ImagesProps) {
    const contextMenu = useContextMenu();

    function handleContextMenu(event: React.MouseEvent, image: Image) {
        event.preventDefault();
        event.stopPropagation();
        contextMenu.open([
            { label: "Abrir em nova aba", icon: "eye", onClick: () => window.open(image.url, "_blank") },
            { label: "Copiar link da imagem", onClick: () => navigator.clipboard.writeText(image.url) },
        ], event.clientX, event.clientY);
    }

    return (
        <div className="flex flex-row gap-8 overflow-auto scrollbar-none">
            {images.map((image) => (
                <img key={image.url} src={image.url} alt={image.description}
                    onContextMenu={(event) => handleContextMenu(event, image)} />
            ))}
        </div>
    );
}

interface Characteristic {
    label: string;
    value: string;
}

function panelCharacteristics(panel: SolarPanel): Characteristic[] {
    const characteristics: Characteristic[] = [];

    if (panel.dimension) {
        characteristics.push({
            label: "Largura x Comprimento",
            value: `${panel.dimension.width.toFixed(3)} m x ${panel.dimension.length.toFixed(2)} m`,
        });
    }
    if (panel.weight !== undefined) { characteristics.push({ label: "Peso", value: `${panel.weight} kg / unidade` }); }
    if (panel.brand) { characteristics.push({ label: "Marca",  value: panel.brand });  }
    if (panel.model) { characteristics.push({ label: "Modelo", value: panel.model }); }
    if (panel.type)  { characteristics.push({ label: "Tipo de Placa Solar", value: panel.type }); }
    
    if (panel.powerOutput !== undefined) { characteristics.push({ label: "Potência",   value: `${panel.powerOutput} W` }); }
    if (panel.efficiency  !== undefined) { characteristics.push({ label: "Eficiência", value: `${panel.efficiency} %` }); }

    return characteristics;
}

function Characteristics({ panel }: { panel: SolarPanel }) {
    const characteristics = panelCharacteristics(panel);

    if (characteristics.length === 0) {
        return <p>Nenhuma característica informada pelo fornecedor.</p>;
    }

    return (
        <ul className="flex flex-col gap-2">
            {characteristics.map(({ label, value }) => (
                <li key={label} className="flex justify-between py-4 px-6 rounded-soft bg-input-bg">
                    <p className="font-medium">{label}</p>
                    <p className="font-medium">{value}</p>
                </li>
            ))}
        </ul>
    );
}

export default function SolarPanelAnnouncement() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<SolarPanelAnnouncement | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) { return; }

        let active = true;

        getSolarPanel(id)
            .then((result) => { if (active) { setProduct(result); } })
            .catch(() => { if (active) { setError(true); } });

        return () => { active = false; };
    }, [id]);

    if (!id) { return <div>Produto não encontrado</div>; }
    if (error) { return <div>Não foi possível carregar o produto</div>; }
    if (!product) { return <div>Carregando...</div>; }

    return (
        <div className="flex flex-col">
            <div className="flex flex-row relative gap-12">
                <div className="w-[40%] flex justify-center">
                    <img className="w-[80%] h-fit sticky top-10 pb-10 object-cover" src={product.photos.heroImage.url} alt={product.photos.heroImage.description} />
                </div>

                <section className="w-[60%] flex flex-col gap-announcement">
                    <section title="Informações gerais">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <h1>{product.title}</h1>
                                <h3 className="text-black/90">{regionsService(product.serviceRegions)}</h3>
                            </div>
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-row gap-6 items-baseline justify-between">
                                    <div className="flex flex-row gap-4 items-baseline">
                                        <span className="flex flex-row items-baseline gap-1"><h2>{product.discountPercentage}</h2><span className="font-bold">%</span></span>
                                        <div className="flex flex-row gap-1 h-min items-baseline">
                                            <h5 className="font-semi-bold no-leading">R$</h5>
                                            <h3 className="no-leading leading-none">{product.unitPrice} / unidade</h3>
                                        </div>
                                    </div>
                                    <h3>{product.availableUnits} unidades</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Button content="Entrar em contato" description="Entrar em contato com o fornecedor" className="px-8" rounded/>
                                    <LightIconButton description="Adicionar ao carrinho" icon="shoppingCart" />
                                </div>
                            </div>
                        </div>
                    </section>
                    <Wrapper title="Descrição"       aria-labelledby="Descrição"       children={<p className="flex max-h-60 text-black/90 overflow-auto">{product.description}</p>} />
                    <Wrapper title="Características" aria-labelledby="Características" children={<Characteristics panel={product.panel} />} className="gap-4" />
                    <Wrapper title="Detalhes"        aria-labelledby="Detalhes"        children={<p className="flex max-h-60 text-black/90 overflow-auto">{product.details}</p>} />
                </section>
            </div>
            <Wrapper title="Imagens do produto" aria-labelledby="Detalhes" className="flex" children={<ProductImages images={product.photos.otherImages} />} />
        </div>
    )
}