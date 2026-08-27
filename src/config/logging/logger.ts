import Log, { LogsMode } from "./logs";

const mode = import.meta.env.VITE_LOGS as LogsMode;

const logger = {
  info(message: string, data?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
        console.info(`${Log.INFO} ${message}`, data ?? "");
    }
  },

  warn(message: string, data?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
        console.warn(`${Log.WARN} ${message}`, data ?? "");
    }
  },

  error(message: string, error?: unknown) {
    if (mode !== LogsMode.DEACTIVATED) {
        console.error(`${Log.ERROR} ${message}`, error ?? "");
    }
  },

  debug(message: string, data?: unknown) {
    if (mode === LogsMode.DEBUG) {
      console.info(`${Log.DEBUG} ${message}`, data ?? "");
    }
  },
};

export default logger;