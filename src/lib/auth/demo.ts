/** Whether the login page should offer demo role shortcuts. */
export function demoLoginEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_ENABLE_DEMO;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}
