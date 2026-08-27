import MocksMode from "@/domain/enum/mocksMode";
import sleep from "@/utils/sleep";
import logger from "@/config/logging/logger";

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
    const mode = import.meta.env.VITE_MOCKS as MocksMode;
    const naptime = 2000;

    async function takeNap() {
        await sleep(naptime);
        logger.info(`Mocks called before ${naptime} ms`);
    }

    if (mode === MocksMode.ALWAYS) {
        takeNap();
        return mockCall();
    }
    
    if (mode === MocksMode.DEACTIVATED) {
        return apiCall();
    }
    
    try {
        return await apiCall();
    }
    
    catch {
        takeNap();
        return mockCall();
    }
}
