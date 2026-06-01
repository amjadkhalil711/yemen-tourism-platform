import type { ApiUser } from "~/types/api";

export const useAuthStore = defineStore("auth", () => {
  const token = useCookie<string | null>("auth_token", {
    default: () => null,
    sameSite: "lax",
    secure: import.meta.env.PROD
  });
  const user = useState<ApiUser | null>("auth_user", () => null);
  const isLoading = ref(false);
  const userFetchedAt = useState<number>("auth_user_fetched_at", () => 0);
  const meRequestPromise = ref<Promise<ApiUser | null> | null>(null);

  const ME_CACHE_TTL_MS = 15_000;

  const api = useApi();

  const isAuthenticated = computed(() => Boolean(token.value));

  const login = async (identifier: string, password: string) => {
    isLoading.value = true;
    try {
      const response = await api.login(identifier, password);
      token.value = response.token;
      user.value = response.user;
      userFetchedAt.value = Date.now();
      return response.user;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchMe = async (options: { force?: boolean } = {}) => {
    const { force = false } = options;

    if (!token.value) {
      user.value = null;
      userFetchedAt.value = 0;
      meRequestPromise.value = null;
      return null;
    }

    const hasFreshProfile = user.value && userFetchedAt.value > 0 && Date.now() - userFetchedAt.value < ME_CACHE_TTL_MS;
    if (!force && hasFreshProfile) {
      return user.value;
    }

    if (meRequestPromise.value) {
      return await meRequestPromise.value;
    }

    meRequestPromise.value = (async () => {
      const response = await api.me();
      user.value = response.data;
      userFetchedAt.value = Date.now();
      return user.value;
    })();

    try {
      return await meRequestPromise.value;
    } finally {
      meRequestPromise.value = null;
    }
  };

  const logout = async () => {
    if (token.value) {
      try {
        await api.logout();
      } catch {
        // Ignore API failure and clear local auth state.
      }
    }
    token.value = null;
    user.value = null;
    userFetchedAt.value = 0;
    meRequestPromise.value = null;
  };

  return { user, token, isLoading, isAuthenticated, login, fetchMe, logout };
});
