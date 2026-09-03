import { getStoredSession } from "@/lib/auth/storage";
import type {
  Branding,
  Location,
  Organization,
  Role,
  StaffMember,
} from "@/lib/types/settings";

const DEMO_STORAGE_KEY = "gravity-demo-settings";

export function isDemoSession(): boolean {
  return getStoredSession()?.accessToken === "demo-access-token";
}

interface DemoStore {
  organization: Organization;
  locations: Location[];
  branding: Branding;
  roles: Role[];
  staff: StaffMember[];
}

const DEFAULT_DEMO: DemoStore = {
  organization: {
    id: "demo-org",
    slug: "gravity-demo",
    name: "Iron Peak Fitness",
    status: "active",
    settings: {
      timezone: { value: "America/New_York" },
      contactEmail: { value: "hello@gravityfitness.com" },
      contactPhone: { value: "(555) 123-4567" },
      corporateAddress: {
        value: "123 Main Street, Suite 200, Austin, TX 78701",
      },
    },
  },
  locations: [
    {
      id: "loc-1",
      tenantId: "demo-org",
      name: "Downtown Club",
      addressLine1: "123 Main Street",
      addressLine2: null,
      phone: "+1 (555) 123-4567",
      city: "Austin",
      region: "TX",
      postalCode: "78701",
      countryCode: "US",
      timezone: "America/Chicago",
      capacity: 40,
      status: "active",
    },
    {
      id: "loc-2",
      tenantId: "demo-org",
      name: "Westside Gym",
      addressLine1: "456 Oak Avenue",
      addressLine2: null,
      phone: "+1 (555) 765-4321",
      city: "Austin",
      region: "TX",
      postalCode: "78704",
      countryCode: "US",
      timezone: "America/Chicago",
      capacity: 60,
      status: "active",
    },
    {
      id: "loc-3",
      tenantId: "demo-org",
      name: "North Campus",
      addressLine1: "789 Pine Road",
      addressLine2: null,
      phone: null,
      city: "Round Rock",
      region: "TX",
      postalCode: "78664",
      countryCode: "US",
      timezone: "America/Chicago",
      capacity: 30,
      status: "inactive",
    },
  ],
  branding: {
    primaryColor: "#0d9488",
    accentColor: "#14b8a6",
    logoUrl: null,
    fontFamily: "var(--font-outfit), system-ui, sans-serif",
  },
  roles: [
    { id: "role-admin", name: "Admin", description: "Full organization access" },
    { id: "role-owner", name: "Owner", description: "Business owner access" },
    { id: "role-coach", name: "Coach", description: "Class and member management" },
    {
      id: "role-receptionist",
      name: "Receptionist",
      description: "Front desk operations",
    },
  ],
  staff: [
    {
      id: "staff-1",
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah@gravityfitness.com",
      roleId: "role-admin",
      roleName: "Admin",
      locationIds: ["loc-1", "loc-2"],
      status: "active",
    },
    {
      id: "staff-2",
      firstName: "Marcus",
      lastName: "Johnson",
      email: "marcus@gravityfitness.com",
      roleId: "role-coach",
      roleName: "Coach",
      locationIds: ["loc-1"],
      status: "active",
    },
    {
      id: "staff-3",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily@gravityfitness.com",
      roleId: "role-receptionist",
      roleName: "Receptionist",
      locationIds: ["loc-2"],
      status: "invited",
    },
  ],
};

function readStore(): DemoStore {
  if (typeof window === "undefined") return DEFAULT_DEMO;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DEMO);
    return { ...DEFAULT_DEMO, ...JSON.parse(raw) } as DemoStore;
  } catch {
    return structuredClone(DEFAULT_DEMO);
  }
}

function writeStore(store: DemoStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
}

export const demoSettings = {
  getOrganization(): Organization {
    return readStore().organization;
  },
  updateOrganization(org: Organization): Organization {
    const store = readStore();
    store.organization = org;
    writeStore(store);
    return org;
  },
  getLocations(): Location[] {
    return readStore().locations;
  },
  saveLocation(location: Location): Location {
    const store = readStore();
    const index = store.locations.findIndex((l) => l.id === location.id);
    if (index >= 0) {
      store.locations[index] = location;
    } else {
      store.locations.push(location);
    }
    writeStore(store);
    return location;
  },
  deleteLocation(id: string): void {
    const store = readStore();
    store.locations = store.locations.filter((l) => l.id !== id);
    writeStore(store);
  },
  getBranding(): Branding {
    return readStore().branding;
  },
  updateBranding(branding: Branding): Branding {
    const store = readStore();
    store.branding = branding;
    writeStore(store);
    return branding;
  },
  getRoles(): Role[] {
    return readStore().roles;
  },
  getStaff(): StaffMember[] {
    return readStore().staff;
  },
  saveStaff(member: StaffMember): StaffMember {
    const store = readStore();
    const index = store.staff.findIndex((s) => s.id === member.id);
    if (index >= 0) {
      store.staff[index] = member;
    } else {
      store.staff.push(member);
    }
    writeStore(store);
    return member;
  },
};
