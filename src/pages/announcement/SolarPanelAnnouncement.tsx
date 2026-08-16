import type { SolarPanelAnnouncement } from "@/domain/models/announcemnt/solarPanel"

function regionsService(regions: string[]): string {
    if (!regions) { return "Entre em contato para" }
    
    let exx = "";
    if      (regions.length == 1) exx = regions[0];
    else if (regions.length == 2) exx = `${regions[0]} e ${regions[1]}`;
    else if (regions.length  > 2) exx = `${regions[0]}, ${regions[1]} e ${regions[2]}`;

    return `Atendimento em ${exx}`;
}

export function SolarPanelAnnouncement(announcement: SolarPanelAnnouncement) {
    return (
        <div>
            <section>
                <div>
                    <div>
                        <h1>{announcement.title}</h1>
                        <h2>{regionsService(announcement.serviceRegions)}</h2>
                    </div>

                    <div className="flex">
                        <div>
                            <h1>{announcement.discountPercentage} %</h1>
                            <span>
                                <sub>R$</sub>
                                <h2>{announcement.unitPrice} / unidade</h2>
                            </span>
                        </div>
                        <h2>{announcement.availableUnits} unidades</h2>
                    </div>
                </div>
                <div>
                    
                </div>
            </section>
        </div>
    )
}