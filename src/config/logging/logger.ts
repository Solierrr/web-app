import Log, { LogsMode } from "./logs";

type ServiceErrorContext = {
  service: string;
  operation: string;
  status?: number;
  error?: unknown;
};

const mode = import.meta.env.VITE_LOGS as LogsMode;
const filename = new URL(import.meta.url).pathname;

const logger = {
  info(message: string, data?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
      console.info(`${Log.INFO} [${filename}] ${message}`, data ?? "");
    }
  },

  warn(message: string, data?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
      console.warn(`${Log.WARN} [${filename}] ${message}`, data ?? "");
    }
  },

  error(message: string, error?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
      console.error(`${Log.ERROR} [${filename}] ${message}`, error ?? "");
    }
  },

  serviceError({ service, operation, status, error }: ServiceErrorContext) {
    const statusLabel = status === undefined ? "" : ` (HTTP ${status})`;
    this.error(`${service}.${operation} failed${statusLabel}`, error);
  },

  debug(message: string, data?: unknown) {
    if (mode === LogsMode.DEBUG) {
      console.info(`${Log.DEBUG} [${filename}] ${message}`, data ?? "");
    }
  },
};

export default logger;
