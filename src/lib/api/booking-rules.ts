import { apiRequest } from "@/lib/api/client";
import { demoMemberships, demoMembershipsEnabled } from "@/lib/memberships/demo";
import type {
  BookingRules,
  UpdateBookingRulesPayload,
} from "@/lib/types/memberships";

export async function getBookingRules(): Promise<BookingRules> {
  if (demoMembershipsEnabled()) return demoMemberships.getBookingRules();
  return apiRequest<BookingRules>("/api/v1/booking-rules");
}

export async function updateBookingRules(
  payload: UpdateBookingRulesPayload,
): Promise<BookingRules> {
  if (demoMembershipsEnabled()) {
    const current = demoMemberships.getBookingRules();
    return demoMemberships.saveBookingRules({ ...current, ...payload });
  }
  return apiRequest<BookingRules>("/api/v1/booking-rules", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
