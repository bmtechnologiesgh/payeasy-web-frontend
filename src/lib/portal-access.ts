/** Spatie role value for employer portal users (see api `RoleName::Employer`). */
export const EMPLOYER_PORTAL_ROLE = "employer";

export function userMayAccessEmployerPortal(roles: string[]): boolean {
  return roles.includes(EMPLOYER_PORTAL_ROLE);
}

/**
 * Roles that may access the internal operations app.
 * Aligned with `App\Enums\RoleName` in api.payeasy.
 */
export const OPS_PORTAL_ROLES = new Set([
  "super_admin",
  "admin",
  "credit_officer",
  "finance_officer",
]);

export function userMayAccessOpsPortal(roles: string[]): boolean {
  return roles.some((r) => OPS_PORTAL_ROLES.has(r));
}
