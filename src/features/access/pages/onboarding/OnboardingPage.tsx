import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { login, register } from "../../access.service";
import {
  register as registerFirebase,
  login as loginFirebase,
  getCurrentFirebaseUser,
  sendVerificationEmail,
  reloadCurrentFirebaseUser,
} from "@/config/firebase/auth/auth.service";
import {
  createCompany,
  createAddress,
  createBusinessContact,
  attachCompanyAddress,
  attachCompanyBusinessContact,
} from "@/features/companies/company.service";
import { redeemAccessCode } from "@/features/companies/company.management.service";
import { validateCnpj, validateCpf } from "@/lib/utils/validation.utils";
import {
  addOperationalMembership,
  claimRegistrationDraft,
  clearRegistrationDraft,
  getOperationalAccount,
  getRegistrationDraft,
  saveOperationalAccount,
  saveRegistrationDraft,
} from "../../access.onboarding.service";
import type { RegistrationKind } from "../../access.onboarding";
import { registrationFields } from "./Onboarding.presets";
import {
  createContact,
  createPerson,
  createProfessionalRegistration,
  createTechnician,
  getProfessions,
  type Profession,
} from "@/features/professionals/professional.onboarding.service";
import { getMyUser } from "@/features/users/user/user.service";
import { validateCertificates, validateCnpjCategory } from "@/lib/shared/validation/aiValidation.service";
import Access from "@/lib/components/layout/access/Access";
import { useTranslation } from "react-i18next";

export default function OnboardingPage({ kind }: { kind: RegistrationKind }) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const navigate = useNavigate();
  const { t } = useTranslation("onboarding");
  const [draft, setDraft] = useState(() => {
    const saved = getRegistrationDraft(kind);
    return kind === "invitation" ? { ...saved, step: 0 } : saved;
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [professions, setProfessions] = useState<Profession[]>([]);
  const isMock = isAlwaysMockMode();
  const titles = Array.from({ length: kind === "company" ? 5 : kind === "professional" ? 4 : 3 }, (_, index) => t(`${kind}Steps.${index}`));
  const finalStep = titles.length - 1;
  const verificationStep = kind === "company" ? 3 : 2;
  const accountStep = kind === "company" ? 2 : kind === "professional" ? 0 : 1;
  const fields = registrationFields(kind, draft.step);

  useEffect(() => {
    if (kind !== "professional") return;
    let active = true;
    getProfessions()
      .then((result) => {
        if (active) setProfessions(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [kind]);

  function update(fields: Record<string, string>, step = draft.step) {
    const next = { ...draft, fields: { ...fields }, step };
    setDraft(next);
    saveRegistrationDraft(next);
  }

  async function identify() {
    const current = getAuthSession();
    if (current && (isMock || getCurrentFirebaseUser()?.email?.toLowerCase() === current.email.toLowerCase())) return;
    if (current && !password) return;
    if (password !== confirmPassword) throw new Error(t("passwordMismatch"));
    const credentials = { email: current?.email ?? draft.fields.email, password };
    if (!current) {
      await register(credentials);
      await login(credentials);
    }
    claimRegistrationDraft(draft);
    if (!isMock) {
      const { user } = await registerFirebase(credentials.email, password).catch(() => loginFirebase(credentials.email, password));
      await sendVerificationEmail(user);
    }
    setPassword("");
    setConfirmPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.step === finalStep) {
      clearRegistrationDraft(kind);
      navigate(routePaths.dashboard(lang));
      return;
    }
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "company" && draft.step === 1 && !isMock) {
        const result = validateCnpj(draft.fields.cnpj.replace(/\D/g, ""));
        if (!result.isValid) throw new Error(result.message ?? t("invalidCnpj"));
      }
      if (kind === "professional" && draft.step === 1 && !isMock) {
        const result = validateCpf(draft.fields.cpf.replace(/\D/g, ""));
        if (!result.isValid) throw new Error(result.message ?? t("invalidCpf"));
      }
      if (draft.step === accountStep) {
        if (kind === "invitation" && !isMock && !getAuthSession()) throw new Error(t("confirmInvitation"));
        await identify();
      }
      if (kind === "company" && draft.step === accountStep) {
        if (isMock) {
          await waitForMockService();
          if (!draft.fields.companyId) update({ ...draft.fields, companyId: crypto.randomUUID() }, draft.step + 1);
          else update(draft.fields, draft.step + 1);
          return;
        } else {
          let companyId = draft.fields.companyId;
          if (!companyId) {
            const company = await createCompany({
              type: draft.fields.type === "DEMANDANT" ? "DEMANDANT" : "SUPPLIER",
              cnpj: draft.fields.cnpj.replace(/\D/g, ""),
              tradeName: draft.fields.tradeName,
              corporateName: draft.fields.corporateName,
            });
            companyId = company.id;
            update({ ...draft.fields, companyId });
          }
          let savedFields: Record<string, string> = { ...draft.fields, companyId };
          const address = savedFields.addressId
            ? { id: savedFields.addressId }
            : await createAddress({
                state: draft.fields.state.toUpperCase(),
                city: draft.fields.city,
                zipCode: draft.fields.zipCode.replace(/\D/g, ""),
                street: draft.fields.street,
                number: draft.fields.number,
              });
          savedFields = { ...savedFields, addressId: address.id };
          update(savedFields);
          await attachCompanyAddress(companyId, address.id);
          const contact = savedFields.businessContactId
            ? { id: savedFields.businessContactId }
            : await createBusinessContact({ companyEmail: draft.fields.companyEmail, phone: draft.fields.phone });
          savedFields = { ...savedFields, businessContactId: contact.id };
          update(savedFields);
          await attachCompanyBusinessContact(companyId, contact.id);
          if (draft.fields.type === "SUPPLIER") await validateCnpjCategory(draft.fields.cnpj.replace(/\D/g, "")).catch(() => undefined);
          update(savedFields, draft.step + 1);
          return;
        }
      }
      if (kind === "professional" && draft.step === 1) {
        if (!isMock) {
          const savedFields = { ...draft.fields };
          const myUser = await getMyUser();
          const contact = savedFields.contactId
            ? { id: savedFields.contactId }
            : await createContact({ email: getAuthSession()?.email, phone: savedFields.phone });
          savedFields.contactId = contact.id;
          update(savedFields);
          const person = savedFields.personId
            ? { id: savedFields.personId }
            : await createPerson({
                userId: myUser.id,
                contactId: contact.id,
                name: savedFields.name,
                cpf: savedFields.cpf.replace(/\D/g, ""),
                birthDate: savedFields.birthDate,
              });
          savedFields.personId = person.id;
          update(savedFields);
          const technician = savedFields.technicianId
            ? { id: savedFields.technicianId }
            : await createTechnician({ personId: person.id, crea: savedFields.crea });
          savedFields.technicianId = technician.id;
          update(savedFields);
          await validateCertificates(savedFields.certNr10Url, savedFields.certNr35Url).catch(() => undefined);
          if (!savedFields.registrationId) {
            const registration = await createProfessionalRegistration({ technicianId: technician.id, professionId: savedFields.professionId });
            savedFields.registrationId = registration.id;
          }
          update(savedFields, draft.step + 1);
          return;
        }
        await waitForMockService();
      }
      if (kind === "invitation" && draft.step === 1) {
        if (isMock) {
          await redeemAccessCode(code);
        } else {
          await redeemAccessCode(code);
        }
      }
      if (kind !== "invitation" && draft.step === verificationStep) {
        if (!isMock) {
          const user = await reloadCurrentFirebaseUser();
          if (!user?.emailVerified || user.email?.toLowerCase() !== getAuthSession()?.email.toLowerCase()) throw new Error(t("confirmEmail"));
          if (kind === "company" && draft.fields.companyEmail.toLowerCase() !== getAuthSession()?.email.toLowerCase())
            throw new Error(t("corporatePending"));
        }
        if (isMock) {
          if (kind === "company")
            addOperationalMembership({
              id: draft.fields.companyId,
              name: draft.fields.tradeName,
              type: draft.fields.type === "DEMANDANT" ? "DEMANDANT" : "SUPPLIER",
              admin: true,
            });
          else saveOperationalAccount({ ...getOperationalAccount(), professional: true });
        }
      }
      update(draft.fields, draft.step + 1);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  const signedIn = getAuthSession();
  const accountFields =
    draft.step === accountStep && signedIn && (isMock || getCurrentFirebaseUser()?.email?.toLowerCase() === signedIn.email.toLowerCase());
  return (
    <Access
      heading={titles[draft.step]}
      fields={[]}
      busy={busy}
      error={error}
      onSubmit={(event) => void submit(event)}
      submitLabel={
        draft.step === finalStep
          ? t("enter")
          : busy
            ? t("waiting")
            : kind !== "invitation" && draft.step === verificationStep
              ? t("confirmed")
              : t("continue")
      }
      footer={
        draft.step < finalStep && (
          <div className="flex flex-wrap justify-between gap-3 text-sm">
            {draft.step > 0 && (
              <button type="button" disabled={busy} onClick={() => update(draft.fields, draft.step - 1)}>
                {t("back")}
              </button>
            )}
            <Link to={routePaths.login(lang)} state={{ returnTo: location.pathname }} className="text-orange">
              {t("hasAccount")}
            </Link>
            <Link to={routePaths.home(lang)}>{t("saveLater")}</Link>
          </div>
        )
      }>
      <div>
        <p className="text-sm text-gray-500">
          {kind === "company" ? t("company") : kind === "professional" ? t("professional") : t("invitation")} ·{" "}
          {t("progress", { step: draft.step + 1, total: titles.length })}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{titles[draft.step]}</h1>
      </div>
      {draft.step === finalStep ? (
        <div className="flex flex-col gap-5 rounded-xl border border-gray-200 p-6">
          <p>{kind === "invitation" ? t("invitationReady") : isMock ? t("mockReady") : t("pending")}</p>
        </div>
      ) : (
        <>
          {kind === "company" && draft.step === 0 ? (
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3">{t("chooseType")}</legend>
              {[
                { value: "SUPPLIER", title: t("SUPPLIER"), description: t("supplierDescription") },
                { value: "DEMANDANT", title: t("DEMANDANT"), description: t("demandantDescription") },
              ].map((option) => (
                <label key={option.value} className="cursor-pointer rounded-xl border border-gray-300 p-5 has-checked:border-orange">
                  <input
                    type="radio"
                    name="companyType"
                    required
                    checked={draft.fields.type === option.value}
                    onChange={() => update({ ...draft.fields, type: option.value })}
                  />
                  <span className="ml-2 font-semibold">{option.title}</span>
                  <p className="mt-2 text-sm text-gray-500">{option.description}</p>
                </label>
              ))}
            </fieldset>
          ) : kind !== "invitation" && draft.step === verificationStep ? (
            <div className="rounded-xl bg-gray-50 p-6">
              <p>{t("verifyPersonal", { email: signedIn?.email })}</p>
              {kind === "company" && draft.fields.companyEmail.toLowerCase() !== signedIn?.email.toLowerCase() && (
                <p className="mt-2">{t("verifyCompany", { email: draft.fields.companyEmail })}</p>
              )}
            </div>
          ) : accountFields ? (
            <p>{t("continueAs", { email: signedIn.email })}</p>
          ) : (
            fields.map((field) => (
              <label key={field.name} className="flex flex-col gap-1 text-sm font-medium">
                {t(`fields.${field.name}`)}
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required}
                  minLength={field.type === "password" ? 12 : undefined}
                  autoComplete={field.type === "password" ? "new-password" : undefined}
                  readOnly={field.name === "email" && Boolean(signedIn)}
                  value={
                    field.name === "email" && signedIn
                      ? signedIn.email
                      : field.name === "password"
                        ? password
                        : field.name === "confirmPassword"
                          ? confirmPassword
                          : field.name === "code"
                            ? code
                            : (draft.fields[field.name] ?? "")
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    if (field.name === "password") setPassword(value);
                    else if (field.name === "confirmPassword") setConfirmPassword(value);
                    else if (field.name === "code") setCode(value);
                    else update({ ...draft.fields, [field.name]: value });
                  }}
                  className="rounded-lg border border-gray-300 p-3 font-normal"
                />
              </label>
            ))
          )}
          {kind === "professional" && draft.step === 1 && (
            <label className="flex flex-col gap-1">
              {t("profession")}
              <select
                required
                value={draft.fields.professionId ?? ""}
                onChange={(event) => update({ ...draft.fields, professionId: event.target.value })}
                className="rounded-lg border border-gray-300 p-3">
                <option value="">{t("chooseProfession")}</option>
                {professions.map((profession) => (
                  <option key={profession.id} value={profession.id}>
                    {profession.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </>
      )}
    </Access>
  );
}
