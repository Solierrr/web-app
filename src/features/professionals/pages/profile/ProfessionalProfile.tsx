import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { getProfessionalBySlug } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";

interface ProfessionalProfilePackedProps {
    professional: Professional;
}

function ProfessionalProfilePacked({ professional }: ProfessionalProfilePackedProps) {
    const registration = professional.registrations?.[0];

    return (
        <ProfilePage
            avatarUrl={professional.avatar}
            name={professional.name}
            subtitle={registration?.profession}
        >
            <div className="flex flex-col gap-2">
                <p className="text-input-text">
                    {professional.address.city}/{professional.address.state}
                </p>
                {professional.contact.email && (
                    <p className="text-input-text">{professional.contact.email}</p>
                )}
                {registration && (
                    <p className="text-input-text">
                        {registration.council} · {registration.number}
                    </p>
                )}
            </div>
        </ProfilePage>
    );
}

export default function ProfessionalProfile() {
    const { professionalSlug = "" } = useParams<{ professionalSlug: string }>();
    const [professional, setProfessional] = useState<Professional | null>(null);

    useEffect(() => {
        let active = true;

        getProfessionalBySlug(professionalSlug).then((result) => {
            if (active) setProfessional(result);
        });

        return () => { active = false; };
    }, [professionalSlug]);

    if (!professional) return <ProfilePageSkeleton />;

    return <ProfessionalProfilePacked professional={professional} />;
}
