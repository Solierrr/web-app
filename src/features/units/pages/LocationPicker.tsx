import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
}

const DEFAULT_CENTER: LatLng = { lat: -23.5505, lng: -46.6333 };

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          element: HTMLElement,
          options: Record<string, unknown>,
        ) => {
          addListener: (event: string, handler: (event: { latLng: { lat: () => number; lng: () => number } }) => void) => void;
        };
        Marker: new (options: Record<string, unknown>) => { setPosition: (position: LatLng) => void };
      };
    };
  }
}

let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o Google Maps"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

// Sem VITE_GOOGLE_MAPS_API_KEY configurada, cai pra dois campos numéricos —
// o mapa interativo depende de uma chave provisionada pelo usuário (fase 05).
export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const { t } = useTranslation("commons", { keyPrefix: "unitsManagement" });
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current || !window.google) return;
        const center = value ?? DEFAULT_CENTER;
        const map = new window.google.maps.Map(mapRef.current, { center, zoom: 14 });
        const marker = new window.google.maps.Marker({ position: center, map });
        map.addListener("click", (event) => {
          const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };
          marker.setPosition(position);
          onChange(position);
        });
      })
      .catch(() => setMapError(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  if (!apiKey || mapError) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600">{t("mapUnavailable")}</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {t("latitude")}
            <input
              type="number"
              step="0.000001"
              value={value?.lat ?? ""}
              onChange={(event) => onChange({ lat: Number(event.target.value), lng: value?.lng ?? 0 })}
              className="rounded-lg border border-gray-300 p-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("longitude")}
            <input
              type="number"
              step="0.000001"
              value={value?.lng ?? ""}
              onChange={(event) => onChange({ lat: value?.lat ?? 0, lng: Number(event.target.value) })}
              className="rounded-lg border border-gray-300 p-2"
            />
          </label>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-64 w-full rounded-lg border border-gray-300" />;
}
