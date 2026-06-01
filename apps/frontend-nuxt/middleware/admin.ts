import { sanitizeAdminRedirect } from "~/utils/admin-redirect";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  const redirectTarget = sanitizeAdminRedirect(to.fullPath);

  if (!auth.isAuthenticated) {
    return navigateTo({ path: "/admin/login", query: { redirect: redirectTarget } });
  }

  if (!auth.user) {
    try {
      await auth.fetchMe();
    } catch {
      await auth.logout();
      return navigateTo({ path: "/admin/login", query: { redirect: redirectTarget } });
    }
  }

  if (auth.user?.role !== "admin") {
    await auth.logout();
    return navigateTo("/");
  }
});
