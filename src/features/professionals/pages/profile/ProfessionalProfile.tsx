import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileChannel from "@@/layout/profile/ProfileChannel";
import ProfileAbout from "@@/layout/profile/ProfileAbout";
import ProfilePageSkeleton from "@@/layout/profile/ProfilePageSkeleton";
import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";
import { PrimaryButton, SurfaceButton } from "@@/ui/button/Button.presets";
import { notify } from "@@/feedback/toast/Toast.utils";
import { addConnection, getMessengerContacts } from "@/features/messages/messages.messenger.api";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { ProfessionalBadges, ProfessionalContactDialog } from "./ProfessionalProfile.reusable";

function ProfessionalProfilePacked({ professional }: { professional: CatalogTechnician }) {
  const { t: market } = useTranslation("marketplace");
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "public" });
  const { t: tChat } = useTranslation("chat");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { hash, pathname, search } = useLocation();
  const navigate = useNavigate();
  const [contactRequested, setContactRequested] = useState(false);
  const contactOpen = contactRequested || hash === "#contato";
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (!professional.userId || !getAuthSession()) return;
    let active = true;
    getMessengerContacts()
      .then((contacts) => {
        if (active) setConnected(contacts.some((contact) => contact.authId === professional.userId));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [professional.userId]);
  function closeContact() {
    setContactRequested(false);
    if (hash === "#contato") navigate({ pathname, search, hash: "" }, { replace: true, preventScrollReset: true });
  }
  async function connect() {
    if (!professional.userId || connecting || connected) return;
    if (!getAuthSession()) {
      navigate(routePaths.login(lang), { state: { returnTo: pathname + search } });
      return;
    }
    setConnecting(true);
    try {
      await addConnection({ userId: professional.userId, username: professional.name, avatar: professional.avatarUrl });
      setConnected(true);
      notify(tProfile("connectionAdded"));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : tChat("connectionError"));
    } finally {
      setConnecting(false);
    }
  }
  const location = [professional.city, professional.state].filter(Boolean).join(", ");
  return (
    <ProfileChannel
      portrait
      name={professional.name}
      bannerUrl={professional.bannerUrl}
      avatarUrl={professional.avatarUrl}
      subtitle={location || undefined}
      metadata={<ProfessionalBadges professional={professional} />}
      actions={
        <>
          {professional.userId && (
            <SurfaceButton
              rounded
              icon={{ name: connected ? "check" : "userPlus", inverse: true }}
              content={tProfile(connected ? "connected" : "addConnection")}
              description={tProfile(connected ? "connected" : "addConnection")}
              disabled={connected || connecting}
              onClick={() => void connect()}
              className="min-h-11"
            />
          )}
          <PrimaryButton
            variant="soft"
            content={market("contact")}
            description={market("contact")}
            onClick={() => setContactRequested(true)}
            className="min-h-11"
          />
        </>
      }>
      <ProfileAbout title={tProfile("aboutMe")} text={professional.about} />
      {contactOpen && <ProfessionalContactDialog professional={professional} onClose={closeContact} />}
    </ProfileChannel>
  );
}

function ProfessionalProfileResource({ professionalSlug }: { professionalSlug: string }) {
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
  if (!professional) return <ProfilePageSkeleton channel />;

  return <ProfessionalProfilePacked professional={professional} />;
}

export default function ProfessionalProfile() {
  const { professionalSlug = "" } = useParams<{ professionalSlug: string }>();
  return <ProfessionalProfileResource key={professionalSlug} professionalSlug={professionalSlug} />;
}
