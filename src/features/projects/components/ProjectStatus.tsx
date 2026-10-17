import StatusField from "@@/ui/status-field/StatusField";
import type { ProjectStatus as Status } from "../projects.d";
import { statusState } from "../projects.utils";
import { useProjects } from "../projects.hooks";
export default function ProjectStatus({ status, archived = false }: { status: Status; archived?: boolean }) {
  const { t } = useProjects();
  return <StatusField state={archived ? "cancelled" : statusState(status)} label={archived ? t("archived") : t(`status.${status}`)} />;
}
