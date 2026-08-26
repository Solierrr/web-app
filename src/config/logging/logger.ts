import Log from "./logs";

const logger = {
  info(message: string, data?: unknown) {
    console.info(`${Log.INFO} ${message}`, data ?? "");
  },

  warn(message: string, data?: unknown) {
    console.warn(`${Log.WARN} ${message}`, data ?? "");
  },

  error(message: string, error?: unknown) {
    console.error(`${Log.ERROR} ${message}`, error ?? "");
  },

  debug(message: string, data?: unknown) {
    console.info(`${Log.DEBUG} ${message}`, data ?? "");
  },
};

export default logger;