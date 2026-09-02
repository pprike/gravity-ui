"use client";

import { useEffect, useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import { ApiClientError } from "@/lib/api/client";
import { listLocations } from "@/lib/api/locations";
import {
  assignUserRoles,
  inviteStaff,
  listRoles,
  listStaff,
} from "@/lib/api/staff";
import { getRoleNavigationHint } from "@/lib/settings/role-permissions";
import type { Location, Role, StaffMember } from "@/lib/types/settings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SidePanel, SidePanelActions } from "@/components/ui/SidePanel";

interface InviteForm {
  fullName: string;
  email: string;
  roleId: string;
  locationIds: string[];
}

const EMPTY_INVITE: InviteForm = {
  fullName: "",
  email: "",
  roleId: "",
  locationIds: [],
};

function statusLabel(status: StaffMember["status"]) {
  if (status === "invited") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusBadgeVariant(status: StaffMember["status"]) {
  if (status === "active") return "active" as const;
  if (status === "invited") return "invited" as const;
  return "inactive" as const;
}

export function StaffRolesSettings() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>(EMPTY_INVITE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [roleChangingId, setRoleChangingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [staffData, rolesData, locationsData] = await Promise.all([
          listStaff(),
          listRoles(),
          listLocations(),
        ]);
        if (cancelled) return;
        setStaff(staffData);
        setRoles(rolesData);
        setLocations(locationsData);
        if (rolesData.length > 0) {
          setInviteForm((f) => ({ ...f, roleId: f.roleId || rolesData[0].id }));
        }
      } catch {
        if (!cancelled) setError("Unable to load staff data.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRoleChange(member: StaffMember, roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    setRoleChangingId(member.id);
    try {
      await assignUserRoles(member.id, [roleId]);
      setStaff((prev) =>
        prev.map((s) =>
          s.id === member.id
            ? { ...s, roleId: role.id, roleName: role.name }
            : s,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to update role.",
      );
    } finally {
      setRoleChangingId(null);
    }
  }

  function toggleLocation(locationId: string) {
    setInviteForm((f) => ({
      ...f,
      locationIds: f.locationIds.includes(locationId)
        ? f.locationIds.filter((id) => id !== locationId)
        : [...f.locationIds, locationId],
    }));
  }

  async function handleInvite() {
    setIsSaving(true);
    setError("");

    const role = roles.find((r) => r.id === inviteForm.roleId);
    if (!role) {
      setError("Please select a role.");
      setIsSaving(false);
      return;
    }

    try {
      const nameParts = inviteForm.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] ?? "";
      const lastName = nameParts.slice(1).join(" ") || firstName;
      const invited = await inviteStaff({
        firstName,
        lastName,
        email: inviteForm.email.trim(),
        roleId: role.id,
        locationIds: inviteForm.locationIds,
      });
      setStaff((prev) => [
        ...prev,
        {
          id: invited.id,
          firstName: invited.firstName,
          lastName: invited.lastName,
          email: invited.email,
          roleId: invited.roleId,
          roleName: invited.roleName,
          locationIds: invited.locationIds,
          status: invited.status,
        },
      ]);
      setPanelOpen(false);
      setInviteForm({ ...EMPTY_INVITE, roleId: roles[0]?.id ?? "" });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to send invite.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function getLocationNames(ids: string[]): string {
    return (
      locations
        .filter((l) => ids.includes(l.id))
        .map((l) => l.name)
        .join(", ") || "All locations"
    );
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
          Administer roles, portal permissions, and active job hubs.
        </p>
        <Button type="button" onClick={() => setPanelOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite Staff
        </Button>
      </div>

      {error && !panelOpen && (
        <p className="mb-4 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700" role="alert">
          {error}
        </p>
      )}

      <Card padding="sm" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-caption text-neutral-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-caption text-neutral-500">{member.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={member.roleId}
                      onChange={(e) => handleRoleChange(member, e.target.value)}
                      disabled={roleChangingId === member.id}
                      className="rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label={`Role for ${member.firstName} ${member.lastName}`}
                      title={getRoleNavigationHint(member.roleName)}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {getLocationNames(member.locationIds)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(member.status)}>
                      {statusLabel(member.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      aria-label={`Copy email for ${member.firstName}`}
                      onClick={() => {
                        void navigator.clipboard.writeText(member.email);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {staff.length === 0 && (
          <p className="px-4 py-8 text-center text-body text-neutral-500">
            No staff members found.
          </p>
        )}
      </Card>

      <SidePanel
        open={panelOpen}
        title="Invite New Staff"
        onClose={() => setPanelOpen(false)}
        highlighted
        footer={
          <SidePanelActions
            onCancel={() => setPanelOpen(false)}
            onSave={handleInvite}
            isSaving={isSaving}
            saveDisabled={!inviteForm.fullName.trim() || !inviteForm.email.trim()}
            saveLabel="Send Invite"
            equalWidth
          />
        }
      >
        <div className="space-y-4">
          <Input
            label="Staff Member Name"
            value={inviteForm.fullName}
            onChange={(e) =>
              setInviteForm((f) => ({ ...f, fullName: e.target.value }))
            }
            placeholder="e.g. Samuel Jackson"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm((f) => ({ ...f, email: e.target.value }))
            }
            placeholder="e.g. sam@ironpeak.com"
            required
          />
          <Select
            label="Access Role"
            value={inviteForm.roleId}
            onChange={(e) =>
              setInviteForm((f) => ({ ...f, roleId: e.target.value }))
            }
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
            required
          />
          {inviteForm.roleId && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {getRoleNavigationHint(
                roles.find((r) => r.id === inviteForm.roleId)?.name ?? "",
              )}
            </p>
          )}
          <div>
            <p className="mb-2 text-[13px] font-medium text-slate-800">
              Assigned Venues
            </p>
            <div className="flex min-h-[42px] flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
              {inviteForm.locationIds.length === 0 && (
                <span className="px-2 py-1 text-sm text-slate-400">
                  Select venues below
                </span>
              )}
              {inviteForm.locationIds.map((locationId) => {
                const location = locations.find((l) => l.id === locationId);
                if (!location) return null;
                return (
                  <span
                    key={locationId}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700"
                  >
                    {location.name}
                    <button
                      type="button"
                      onClick={() => toggleLocation(locationId)}
                      className="rounded hover:text-primary-900"
                      aria-label={`Remove ${location.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {locations
                .filter((l) => !inviteForm.locationIds.includes(l.id))
                .map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => toggleLocation(location.id)}
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-400"
                  >
                    + {location.name}
                  </button>
                ))}
            </div>
          </div>
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
