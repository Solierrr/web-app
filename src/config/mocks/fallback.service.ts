import logger from "@/config/logging/logger";
import { getMocksMode, waitForMockService } from "./mockMode.utils";

import MocksMode from "./mocksMode.enum";

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
  const mode = getMocksMode();

  async function takeNap() {
    await waitForMockService();
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
