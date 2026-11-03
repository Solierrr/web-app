import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import Input from "@@/ui/input/Input";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import type { MessengerContact } from "@/features/messages/messages.messenger.api";
import PersonChecklist from "./PersonChecklist";

/** Janela para criar um grupo avulso: um nome e, no mínimo, mais uma pessoa entre as conexões. */
export default function NewGroupDialog({
  contacts,
  loading,
  error,
  creating,
  onCreate,
  onClose,
}: {
  contacts: MessengerContact[];
  loading: boolean;
  error: boolean;
  creating: boolean;
  onCreate: (title: string, participantIds: string[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("chat");
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const valid = title.trim().length > 0 && selected.length > 0;

  return (
    <Dialog title={t("newGroup")} onClose={onClose} busy={creating} compact quiet>
      <form
        className="flex flex-col gap-4 text-left"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid && !creating) onCreate(title.trim(), selected);
        }}>
        <Input
          name="title"
          aria-label={t("groupTitle")}
          placeholder={t("groupTitle")}
          value={title}
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
        />
        <PersonChecklist
          people={contacts.map((contact) => ({ id: contact.authId, name: contact.username }))}
          selected={selected}
          onChange={setSelected}
          disabled={creating}
          empty={loading ? t("loading") : t("noInvitable")}
        />
        {error && (
          <p role="alert" className="text-body">
            {t("contactsError")}
          </p>
        )}
        <PrimaryButton variant="soft" type="submit" content={t("createGroup")} description={t("createGroup")} disabled={!valid || creating} />
      </form>
    </Dialog>
  );
}
