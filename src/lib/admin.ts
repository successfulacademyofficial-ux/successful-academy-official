export const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";

export function isAdminEmail(email: string | null | undefined) {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}

export function getAccountMode(email: string | null | undefined) {
  return isAdminEmail(email) ? "admin" : "student";
}

export function getAccountModeText(
  email: string | null | undefined,
  adminText = "Admin Mode",
  studentText = "Student Mode"
) {
  return isAdminEmail(email) ? adminText : studentText;
}