const ROLE_BASE_PATHS = ["staff", "super_admin", "client", "admin"];

export const getBaseRoleFromPath = (pathname = "") => {
    const baseRole = pathname.split("/").filter(Boolean)[0];
    return ROLE_BASE_PATHS.includes(baseRole) ? baseRole : null;
};

export const isRoleRoute = (pathname, role) => {
    return getBaseRoleFromPath(pathname) === role;
};