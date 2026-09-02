"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { listLocations } from "@/lib/api/locations";
import type { Location } from "@/lib/types/settings";

const LOCATION_STORAGE_KEY = "gravity-selected-location";

interface WorkspaceContextValue {
  locations: Location[];
  selectedLocationId: string | undefined;
  selectedLocation: Location | undefined;
  setSelectedLocationId: (id: string | undefined) => void;
  isLoadingLocations: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationIdState] = useState<
    string | undefined
  >(undefined);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await listLocations();
        if (cancelled) return;
        const active = loaded.filter((location) => location.status === "active");
        const usable = active.length > 0 ? active : loaded;
        setLocations(usable);

        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem(LOCATION_STORAGE_KEY)
            : null;
        const storedValid = usable.some((location) => location.id === stored);
        setSelectedLocationIdState(
          storedValid ? stored! : usable[0]?.id,
        );
      } catch {
        if (!cancelled) setLocations([]);
      } finally {
        if (!cancelled) setIsLoadingLocations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedLocationId = useCallback((id: string | undefined) => {
    setSelectedLocationIdState(id);
    if (typeof window === "undefined") return;
    if (id) {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, id);
    } else {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId),
    [locations, selectedLocationId],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      locations,
      selectedLocationId,
      selectedLocation,
      setSelectedLocationId,
      isLoadingLocations,
    }),
    [
      locations,
      selectedLocationId,
      selectedLocation,
      setSelectedLocationId,
      isLoadingLocations,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}

export function useWorkspaceOptional() {
  return useContext(WorkspaceContext);
}
