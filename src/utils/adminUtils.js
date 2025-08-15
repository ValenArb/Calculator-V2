// Admin utility functions
export const ADMIN_EMAILS = [
  'valenarbert@gmail.com', // Main admin account
  'admin@calculadoraelectrica.com',
  'valentin@admin.com',
  'admin@example.com',
  // Add more admin emails here as needed
];

/**
 * Check if a user email is an admin
 * @param {string} email - User email to check
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Check if current user is admin (use with useSelector)
 * @param {object} user - User object from Redux state
 * @returns {boolean} - True if current user is admin
 */
export const isCurrentUserAdmin = (user) => {
  return user && user.email && isAdmin(user.email);
};

/**
 * Admin-only wrapper component
 * @param {object} props - Component props
 * @param {object} props.user - User object
 * @param {React.ReactNode} props.children - Components to render if admin
 * @param {React.ReactNode} props.fallback - Optional fallback component for non-admins
 * @returns {React.ReactNode}
 */
export const AdminOnly = ({ user, children, fallback = null }) => {
  if (!isCurrentUserAdmin(user)) {
    return fallback;
  }
  return children;
};

export default {
  isAdmin,
  isCurrentUserAdmin,
  AdminOnly,
  ADMIN_EMAILS
};