import { useTranslation } from "react-i18next";
import { PrimaryButton, SurfaceButton } from "@@/ui/button/Button.presets";
import Surface from "@@/ui/surface/Surface";
import { PushStatus } from "../notification.enum";
import { usePushStatus } from "../notification.hooks";

export default function PushToggle() {
  const { t } = useTranslation("notifications", { keyPrefix: "push" });
  const { status, busy, failed, enable, disable } = usePushStatus();

  if (status === null || status === PushStatus.UNCONFIGURED) return null;
  const on = status === PushStatus.ON;
  const unavailable = status === PushStatus.UNSUPPORTED || status === PushStatus.BLOCKED;
  const state = on ? t("on") : status === PushStatus.BLOCKED ? t("blocked") : status === PushStatus.UNSUPPORTED ? t("unsupported") : t("off");
  const Button = on ? SurfaceButton : PrimaryButton;

  return (
    <Surface role="region" aria-labelledby="push-toggle-title" contentClassName="flex flex-col gap-3 p-4">
      <h2 id="push-toggle-title" className="text-label font-medium">
        {t("title")}
      </h2>
      <p className="text-operational-muted">{t("description")}</p>
      <p role="status">{state}</p>
      {!unavailable && (
        <Button
          type="button"
          disabled={busy}
          content={on ? t("disable") : t("enable")}
          description={on ? t("disable") : t("enable")}
          onClick={() => void (on ? disable() : enable())}
          className="min-h-12 w-full sm:w-fit"
        />
      )}
      {failed && <p role="alert">{t("error")}</p>}
    </Surface>
  );
}
