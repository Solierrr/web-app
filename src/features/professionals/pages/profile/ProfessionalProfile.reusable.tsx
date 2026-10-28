import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import GroupAction from "@@/ui/button/GroupAction";
import StatusField from "@@/ui/status-field/StatusField";
import Surface from "@@/ui/surface/Surface";
import type { CatalogTechnician } from "@/features/professionals/professional.service";

/** Chips sob o nome do profissional: cada profissão em laranja e cada registro em verde, no mesmo formato do perfil da empresa. */
export function ProfessionalBadges({ professional }: { professional: Pick<CatalogTechnician, "professions" | "registrations" | "crea"> }) {
  const registrations = professional.registrations?.length
    ? professional.registrations.map((registration) => `${registration.council} ${registration.number}`)
    : professional.crea
      ? [`CREA ${professional.crea}`]
      : [];
  return (
    <>
      {professional.professions.map((profession) => (
        <StatusField key={profession} state="highlight" pill icon="registrations" label={profession} />
      ))}
      {registrations.map((registration) => (
        <StatusField key={registration} state="approved" pill icon="shieldCheck" label={registration} />
      ))}
    </>
  );
}

/** Contato público do profissional: lista de canais em um bloco único, cada um com ícone, rótulo e o valor. */
export function ProfessionalContactDialog({
  professional,
  onClose,
}: {
  professional: Pick<CatalogTechnician, "name" | "contact">;
  onClose: () => void;
}) {
  const { t: market } = useTranslation("marketplace");
  const { email, number } = professional.contact ?? {};
  return (
    <Dialog title={market("contactDetails")} message={professional.name} onClose={onClose} compact quiet>
      {email || number ? (
        <Surface contentClassName="overflow-hidden!">
          <ul className="flex flex-col divide-y divide-operational-border/60">
            {email && (
              <li>
                <GroupAction
                  to={`mailto:${encodeURIComponent(email)}`}
                  icon="mail"
                  label={market("email")}
                  content={market("email")}
                  detail={email}
                  className="min-h-16 w-full px-5 py-3"
                />
              </li>
            )}
            {number && (
              <li>
                <GroupAction
                  to={`tel:${number.replace(/[^\d+]/g, "")}`}
                  icon="phone"
                  label={market("phone")}
                  content={market("phone")}
                  detail={number}
                  className="min-h-16 w-full px-5 py-3"
                />
              </li>
            )}
          </ul>
        </Surface>
      ) : (
        <p className="text-body text-operational-muted">{market("noContact")}</p>
      )}
    </Dialog>
  );
}
