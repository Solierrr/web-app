import logger from "@/config/logging/logger";

import MocksMode from "./mocksMode.enum";
import { getMocksMode, getMockDelayMs, waitForMockService } from "./mockMode.utils";

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
  const mode = getMocksMode();

  if (mode === MocksMode.ALWAYS) {
    await waitForMockService();
    logger.info(`Mock service delay completed (${getMockDelayMs()} ms)`);
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
    await waitForMockService();
    logger.info(`Mock fallback delay completed (${getMockDelayMs()} ms)`);
    return mockCall();
  }
}
