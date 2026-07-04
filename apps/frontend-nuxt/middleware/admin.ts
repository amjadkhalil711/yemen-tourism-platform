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

  const role = auth.user?.role || "";
  if (!role.startsWith("admin")) {
    await auth.logout();
    return navigateTo("/");
  }

  // Enforce sub-roles on route level
  const path = to.path;
  if (path.startsWith("/admin/cities") && role !== "admin" && role !== "admin_cities") {
    return navigateTo("/admin/dashboard");
  }
  if (path.startsWith("/admin/landmarks") && role !== "admin" && role !== "admin_landmarks") {
    return navigateTo("/admin/dashboard");
  }
  if (path.startsWith("/admin/visitors") && role !== "admin" && role !== "admin_visitors") {
    return navigateTo("/admin/dashboard");
  }
  if (path.startsWith("/admin/report") && role !== "admin" && role !== "admin_report") {
    return navigateTo("/admin/dashboard");
  }
  if (path.startsWith("/admin/messages") && role !== "admin" && role !== "admin_messages") {
    return navigateTo("/admin/dashboard");
  }
  if (path.startsWith("/admin/admins") && role !== "admin") {
    return navigateTo("/admin/dashboard");
  }
});
