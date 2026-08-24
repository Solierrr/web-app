import MocksMode from "@/domain/enum/mocksMode";

export async function resolveWithMocks<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>): Promise<T> {
    const mode = import.meta.env.VITE_MOCKS as MocksMode;

    if (mode === MocksMode.Always) { return mockCall(); }

    if (mode === MocksMode.Deactivated) { return apiCall(); }

    try {
        return await apiCall();
    } catch {
        return mockCall();
    }
}
