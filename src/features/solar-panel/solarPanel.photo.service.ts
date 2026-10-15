import i18n from "@/config/i18n/internationalization";
import { httpJson } from "@/lib/shared/http/http.service";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

export interface ModelPhoto {
  id: string;
  modelId: string;
  url: string;
  createdAt: string;
  primary?: boolean;
}
const API = import.meta.env.VITE_API_CORE;
const KEY = "solaria.mock.modelPhotos";
const message = () => i18n.t("crud:solarPanelModel.photos.error");
function mocks(): ModelPhoto[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ModelPhoto[];
  } catch {
    return [];
  }
}

export async function listModelPhotos(modelId: string): Promise<ModelPhoto[]> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const photos = mocks().filter((photo) => photo.modelId === modelId);
    if (photos.length && photos.every((photo) => photo.primary === undefined)) {
      const main = [...photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const normalized = photos.map((photo) => ({ ...photo, primary: photo.id === main.id }));
      localStorage.setItem(KEY, JSON.stringify([...mocks().filter((photo) => photo.modelId !== modelId), ...normalized]));
      return normalized;
    }
    return photos;
  }
  return httpJson<ModelPhoto[]>(`${API}/api/model-photos/model/${encodeURIComponent(modelId)}`, {
    service: "solarPanel",
    operation: "listModelPhotos",
    errorMessage: message(),
  });
}

export async function uploadModelPhoto(modelId: string, file: File, primary = false): Promise<ModelPhoto> {
  if (file.size === 0 || file.size > 8 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error(i18n.t("crud:solarPanelModel.photos.invalid"));
  }
  if (isAlwaysMockMode()) {
    await waitForMockService();
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const photo = { id: crypto.randomUUID(), modelId, url, primary, createdAt: new Date().toISOString() };
    localStorage.setItem(
      KEY,
      JSON.stringify([...mocks().map((current) => (primary && current.modelId === modelId ? { ...current, primary: false } : current)), photo]),
    );
    return photo;
  }
  const body = new FormData();
  body.set("modelId", modelId);
  body.set("file", file);
  body.set("primary", String(primary));
  return httpJson<ModelPhoto>(`${API}/api/model-photos`, {
    service: "solarPanel",
    operation: "uploadModelPhoto",
    method: "POST",
    body,
    errorMessage: message(),
  });
}

export async function deleteModelPhoto(id: string): Promise<void> {
  if (isAlwaysMockMode()) {
    await waitForMockService();
    localStorage.setItem(KEY, JSON.stringify(mocks().filter((photo) => photo.id !== id)));
    return;
  }
  return httpJson<void>(`${API}/api/model-photos/${encodeURIComponent(id)}`, {
    service: "solarPanel",
    operation: "deleteModelPhoto",
    method: "DELETE",
    errorMessage: message(),
  });
}
