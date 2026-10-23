import StatusPage from "@@/layout/status-page/StatusPage";
import { PrimaryButton } from "@@/ui/button/Button.presets";

interface ErrorPageProps {
  code?: string;
  title: string;
  message: string;
  actionLabel: string;
  onReturn: () => void;
}

export default function ErrorPage({ code, title, message, actionLabel, onReturn }: ErrorPageProps) {
  return (
    <StatusPage
      code={code}
      title={title}
      message={message}
      actions={
        <PrimaryButton rounded variant="soft" type="button" content={actionLabel} description={actionLabel} onClick={onReturn} className="min-h-12 min-w-48" />
      }
    />
  );
}
