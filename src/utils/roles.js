// Role helpers shared across routing and navigation.
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

// roleHome is where a user lands after login / when they hit a route they
// shouldn't see.
export function roleHome(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/admin";
    case ROLES.DOCTOR:
      return "/doctor";
    case ROLES.RECEPTIONIST:
      return "/reception";
    default:
      return "/";
  }
}

export function isStaff(role) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.DOCTOR ||
    role === ROLES.RECEPTIONIST
  );
}
