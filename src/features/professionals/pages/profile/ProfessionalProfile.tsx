import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";
import { ProfileInfoRow, ProfileInfoSection } from "@/lib/components/layout/profile/ProfilePage.reusable";
import Icon from "@@/ui/icon/Icon";

interface ProfessionalProfilePackedProps {
  professional: CatalogTechnician;
}

function ProfessionalProfilePacked({ professional }: ProfessionalProfilePackedProps) {
  const { t } = useTranslation("profile", { keyPrefix: "edit" });
  const { t: market } = useTranslation("marketplace");
  const { hash } = useLocation();
  const contact = useRef<HTMLElement>(null);
  useEffect(() => {
    if (hash === "#contato") contact.current?.scrollIntoView?.({ block: "start" });
  }, [hash]);

  return (
    <ProfilePage name={professional.name} subtitle={professional.professions[0]}>
      <ProfileInfoSection title={t("professionalTitle")}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={t("profession")} value={professional.professions.join(", ")} />
          <ProfileInfoRow label={t("crea")} value={professional.crea} />
        </dl>
      </ProfileInfoSection>
      <section ref={contact} id="contato" className="flex scroll-mt-8 flex-col gap-5">
        <h2 className="text-label font-semi-bold">{market("contactDetails")}</h2>
        {professional.contact?.email && (
          <a href={`mailto:${encodeURIComponent(professional.contact.email)}`} className="flex w-fit items-center gap-3 text-body text-orange">
            <Icon name="messages" size={20} />
            {market("email")}
          </a>
        )}
        {professional.contact?.number && (
          <a href={`tel:${professional.contact.number.replace(/[^\d+]/g, "")}`} className="w-fit text-body text-orange">
            {market("phone")}
          </a>
        )}
        {!professional.contact?.email && !professional.contact?.number && <p className="text-body text-operational-muted">{market("noContact")}</p>}
      </section>
    </ProfilePage>
  );
}

export default function ProfessionalProfile() {
  const { professionalSlug = "" } = useParams<{ professionalSlug: string }>();
  const { t } = useTranslation("commons", { keyPrefix: "professionalProfile" });
  const [professional, setProfessional] = useState<CatalogTechnician | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getCatalogTechnicianBySlug(professionalSlug)
      .then((result) => {
        if (active) setProfessional(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [professionalSlug]);

  if (error)
    return (
      <p role="alert" className="p-6">
        {t("loadError")}
      </p>
    );
  if (!professional) return <ProfilePageSkeleton />;

  return <ProfessionalProfilePacked professional={professional} />;
}
