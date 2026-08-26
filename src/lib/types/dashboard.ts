export interface RevenueSummary {
  mtdCents: number;
  priorMtdCents: number;
  currency: string;
}

export interface ActiveMembershipsSummary {
  count: number;
  priorCount: number;
}

export interface ClassOccupancySummary {
  avgPercent: number;
  sessionsToday: number;
  nearFullCount: number;
  fullCount: number;
}

export interface CheckInsSummary {
  count: number;
  priorDayCount: number;
}

export interface DashboardSessionSummary {
  id: string;
  name: string;
  coachName: string | null;
  timeRange: string;
  bookedCount: number;
  capacity: number;
  status: "OPEN" | "ALMOST FULL" | "FULL" | string;
}

export interface DashboardCheckInSummary {
  userId: string;
  displayName: string;
  memberCode: string;
  checkedInAt: string;
  status: "ACTIVE" | "PENDING RENEWAL" | string;
}

export interface ExecutiveDashboard {
  revenue: RevenueSummary;
  activeMemberships: ActiveMembershipsSummary;
  classOccupancy: ClassOccupancySummary;
  checkInsToday: CheckInsSummary;
  todaySessions: DashboardSessionSummary[];
  recentCheckIns: DashboardCheckInSummary[];
}
