import { jwtDecode } from "jwt-decode";

// Returns the current user's role and a helper function
// to check if they have a specific permission.
//
// Usage in any component:
//   const { role, can } = usePermissions();
//   if (can("run:auction")) { ... }

const usePermissions = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return { role: null, permissions: [], can: () => false };
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded.role || null;

        // Permissions are NOT in the JWT — they come from the backend
        // This hook is for UI hints only, not real security.
        // The backend PermissionMiddleware is the real check.
        return {
            role,
            can: () => false   // UI can't check permissions without an API call
        };
    } catch {
        return { role: null, permissions: [], can: () => false };
    }
};

export default usePermissions;