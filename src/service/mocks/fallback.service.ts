import MocksMode from "@/domain/enum/mocksMode";
import sleep from "@/utils/sleep";

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
    const mode = import.meta.env.VITE_MOCKS as MocksMode;

    if (mode === MocksMode.Always) {
        await sleep(2000);
        return mockCall();
    }
    
    if (mode === MocksMode.Deactivated) {
        return apiCall();
    }
    
    try {
        return await apiCall();
    }
    
    catch {
        await sleep(2000);
        return mockCall();
    }
}
