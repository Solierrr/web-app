import logger from "@/config/logging/logger";
import sleep from "@lib/utils/sleep.utils";

import MocksMode from "./mocksMode.enum";

const NAP_TIME_MS = 2000;

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
  const mode = import.meta.env.VITE_MOCKS as MocksMode;

  async function takeNap() {
    await sleep(NAP_TIME_MS);
    logger.info(`Mocks called before ${NAP_TIME_MS} ms`);
  }

  if (mode === MocksMode.ALWAYS) {
    await takeNap();
    return mockCall();
  }

  if (mode === MocksMode.DEACTIVATED) {
    return apiCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    logger.serviceError({
      service: "mocks",
      operation: "resolveWithMocks",
      error,
    });
    await takeNap();
    return mockCall();
  }
}
