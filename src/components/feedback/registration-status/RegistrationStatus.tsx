import { useTranslation } from "react-i18next";

export type RegistrationStatusKind = "PENDING" | "APPROVED" | "REJECTED";

interface RegistrationStatusProps {
  status: RegistrationStatusKind;
  reason?: string;
}

const STYLES: Record<RegistrationStatusKind, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function RegistrationStatus({ status, reason }: RegistrationStatusProps) {
  const { t } = useTranslation("commons", { keyPrefix: "registrationStatus" });

  return (
    <div className="flex flex-col gap-2">
      <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${STYLES[status]}`}>
        {t(status.toLowerCase())}
      </span>
      {reason ? <p className="text-sm text-gray-600">{reason}</p> : null}
    </div>
  );
}
