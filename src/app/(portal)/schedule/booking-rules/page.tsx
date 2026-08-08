import { redirect } from "next/navigation";

export default function ScheduleBookingRulesRedirect() {
  redirect("/settings?tab=booking-rules");
}
