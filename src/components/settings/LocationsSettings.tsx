"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Phone, Plus, Power, Users } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import {
  createLocation,
  listLocations,
  updateLocation,
} from "@/lib/api/locations";
import {
  formatLocationStreet,
  getLocationMemberLabel,
  getLocationPhone,
} from "@/lib/settings/location-display";
import type { Location } from "@/lib/types/settings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SidePanel, SidePanelActions } from "@/components/ui/SidePanel";

interface LocationForm {
  name: string;
  addressLine1: string;
  phone: string;
  capacity: string;
}

const EMPTY_FORM: LocationForm = {
  name: "",
  addressLine1: "",
  phone: "",
  capacity: "",
};

function toForm(location: Location): LocationForm {
  return {
    name: location.name,
    addressLine1: location.addressLine1 ?? "",
    phone: getLocationPhone(location) ?? "",
    capacity: location.capacity?.toString() ?? "",
  };
}

export function LocationsSettings() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLocations(await listLocations());
      } catch {
        if (!cancelled) setError("Unable to load locations.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reload() {
    try {
      setLocations(await listLocations());
    } catch {
      setError("Unable to load locations.");
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setPanelOpen(true);
  }

  function openEdit(location: Location) {
    setEditingId(location.id);
    setForm(toForm(location));
    setError("");
    setPanelOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      const capacity = form.capacity ? parseInt(form.capacity, 10) : undefined;
      const phoneValue = form.phone.trim()
        ? `tel:${form.phone.trim()}`
        : undefined;

      if (editingId) {
        const existing = locations.find((l) => l.id === editingId);
        await updateLocation(editingId, {
          name: form.name.trim(),
          addressLine1: form.addressLine1.trim() || undefined,
          addressLine2: phoneValue,
          city: existing?.city ?? undefined,
          region: existing?.region ?? undefined,
          postalCode: existing?.postalCode ?? undefined,
          countryCode: existing?.countryCode ?? undefined,
          timezone: existing?.timezone ?? "America/Chicago",
          capacity,
          status: existing?.status ?? "active",
        });
      } else {
        await createLocation({
          name: form.name.trim(),
          addressLine1: form.addressLine1.trim() || undefined,
          addressLine2: phoneValue,
          timezone: "America/Chicago",
          capacity,
          status: "active",
        });
      }
      setPanelOpen(false);
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to save location.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    const location = locations.find((l) => l.id === id);
    if (!location) return;
    try {
      await updateLocation(id, {
        name: location.name,
        addressLine1: location.addressLine1 ?? undefined,
        addressLine2: location.addressLine2 ?? undefined,
        city: location.city ?? undefined,
        region: location.region ?? undefined,
        postalCode: location.postalCode ?? undefined,
        countryCode: location.countryCode ?? undefined,
        timezone: location.timezone ?? "America/Chicago",
        capacity: location.capacity ?? undefined,
        status: "inactive",
      });
      await reload();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to deactivate location.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base text-slate-500">
          Manage your physical workout hubs and member capacities.
        </p>
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </div>

      {error && !panelOpen && (
        <p className="mb-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
          {error}
        </p>
      )}

      {locations.length === 0 ? (
        <Card className="text-center">
          <p className="text-body text-neutral-600">No locations yet.</p>
          <Button className="mt-4" onClick={openCreate}>
            Add your first location
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {locations.map((location) => {
            const phone = getLocationPhone(location);
            const memberLabel = getLocationMemberLabel(location);

            return (
              <Card key={location.id} padding="sm" className="flex flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{location.name}</h3>
                  <Badge variant={location.status === "active" ? "active" : "inactive"}>
                    {location.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2.5 text-[13px] text-slate-500">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{formatLocationStreet(location)}</span>
                  </p>
                  {phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {phone}
                    </p>
                  )}
                  {memberLabel && (
                    <p className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {memberLabel}
                    </p>
                  )}
                </div>
                <div className="mt-5 flex gap-3 border-t border-slate-100 pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => openEdit(location)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Details
                  </Button>
                  {location.status === "active" && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleDeactivate(location.id)}
                    >
                      <Power className="h-4 w-4" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SidePanel
        open={panelOpen}
        title={editingId ? "Edit Location" : "Add New Location"}
        onClose={() => setPanelOpen(false)}
        highlighted={!editingId}
        footer={
          <SidePanelActions
            onCancel={() => setPanelOpen(false)}
            onSave={handleSave}
            isSaving={isSaving}
            saveDisabled={!form.name.trim() || !form.addressLine1.trim()}
            saveLabel={editingId ? "Save Changes" : "Save Venue"}
            equalWidth
          />
        }
      >
        <div className="space-y-4">
          <Input
            label="Location Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Iron Peak East"
            required
          />
          <Input
            label="Street Address"
            value={form.addressLine1}
            onChange={(e) =>
              setForm((f) => ({ ...f, addressLine1: e.target.value }))
            }
            placeholder="e.g. 100 Main St"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
          <Input
            label="Initial Member Capacity"
            type="number"
            min={0}
            value={form.capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacity: e.target.value }))
            }
            placeholder="e.g. 500"
          />
          {error && (
            <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
              {error}
            </p>
          )}
        </div>
      </SidePanel>
    </>
  );
}
