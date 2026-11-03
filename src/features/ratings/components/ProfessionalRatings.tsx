import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { NativeSelect } from "@@/ui/select/Select";
import Textarea from "@@/ui/textarea/Textarea";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { notify } from "@@/feedback/toast/Toast.utils";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { getUserSummary } from "@/features/messages/messages.messenger.api";
import { averageRating, createRating, excludeRating, listRatingsOf, updateRating, type Rating } from "../ratings.service";

const SCORES = [5, 4, 3, 2, 1];

/**
 * Avaliações de um profissional no perfil público: média, comentários com o nome de quem avaliou e, para quem está logado e
 * não é o próprio profissional, avaliar, editar ou excluir a própria avaliação.
 */
export default function ProfessionalRatings({ evaluatedId }: { evaluatedId: string }) {
  const { t } = useTranslation("profile", { keyPrefix: "ratings" });
  const userId = getAuthSession()?.userId;
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    listRatingsOf(evaluatedId)
      .then(async (items) => {
        if (!active) return;
        const visible = items.filter((item) => item.status === "ACTIVE");
        setRatings(visible);
        const people = [...new Set(visible.map((item) => item.evaluatorId))];
        const summaries = await Promise.allSettled(people.map(getUserSummary));
        if (active)
          setNames(
            Object.fromEntries(
              people.flatMap((id, index) => (summaries[index].status === "fulfilled" ? [[id, summaries[index].value.username]] : [])),
            ),
          );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [evaluatedId]);

  const mine = ratings.find((item) => item.evaluatorId === userId);
  const average = averageRating(ratings);
  const canRate = !!userId && userId !== evaluatedId;

  function startEdit() {
    setScore(mine?.rating ?? 5);
    setComment(mine?.comment ?? "");
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const text = comment.trim() || undefined;
      const saved = mine
        ? await updateRating(mine.id, { rating: score, comment: text })
        : await createRating({ evaluatedId, typeRate: "PROFISSIONAL", rating: score, comment: text });
      setRatings((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setEditing(false);
      notify(t("saved"));
    } catch (failure) {
      notify((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!mine) return;
    setBusy(true);
    try {
      await excludeRating(mine.id);
      setRatings((current) => current.filter((item) => item.id !== mine.id));
    } catch (failure) {
      notify((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label={t("title")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-label font-semi-bold text-operational-ink">{t("title")}</h2>
        {canRate && !editing && (
          <PrimaryButton variant="soft" content={t(mine ? "edit" : "rate")} description={t(mine ? "edit" : "rate")} onClick={startEdit} />
        )}
      </div>
      <p className="text-body text-operational-muted">{average === null ? t("empty") : t("average", { average, count: ratings.length })}</p>
      {editing && (
        <form className="flex max-w-160 flex-col gap-3" onSubmit={(event) => void save(event)}>
          <label className="flex flex-col gap-2 text-body text-operational-ink">
            {t("score")}
            <NativeSelect name="score" value={score} onChange={(event) => setScore(Number(event.target.value))} disabled={busy}>
              {SCORES.map((value) => (
                <option key={value} value={value}>
                  {t("stars", { count: value })}
                </option>
              ))}
            </NativeSelect>
          </label>
          <Textarea
            name="comment"
            aria-label={t("comment")}
            placeholder={t("comment")}
            value={comment}
            maxLength={1000}
            rows={3}
            className="w-full!"
            disabled={busy}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className="flex gap-2">
            <PrimaryButton type="submit" content={t("save")} description={t("save")} disabled={busy} />
            <ToolbarAction label={t("cancel")} content={t("cancel")} disabled={busy} onClick={() => setEditing(false)} />
          </div>
        </form>
      )}
      <ul className="flex flex-col gap-3">
        {ratings.map((item) => (
          <li key={item.id} className="flex max-w-160 flex-col gap-1">
            <span className="text-body font-medium text-operational-ink">
              {item.evaluatorId === userId ? t("you") : names[item.evaluatorId] || t("someone")} · {t("stars", { count: item.rating })}
            </span>
            {item.comment && <p className="whitespace-pre-line break-words text-body text-operational-muted">{item.comment}</p>}
            {item.evaluatorId === userId && !editing && (
              <ToolbarAction
                icon="trash"
                label={t("delete")}
                content={t("delete")}
                disabled={busy}
                onClick={() => void remove()}
                className="self-start"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
