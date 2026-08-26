export interface FrontDeskCheckIn {
  id: string;
  userId: string;
  displayName: string;
  memberCode: string;
  checkedInAt: string;
  locationName: string | null;
  membershipStatus: "ACTIVE" | "PENDING RENEWAL" | string;
  source: "manual" | "qr" | "booking" | string;
}

export interface ManualCheckInPayload {
  userId: string;
  locationId?: string;
}
