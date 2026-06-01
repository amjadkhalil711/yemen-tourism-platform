import { defineEventHandler, setHeader } from "h3";

interface SitemapCityPayload {
  slug?: string | null;
}

interface SitemapCityResponse {
  data?: SitemapCityPayload[];
  meta?: {
    last_page?: number;
  };
  last_page?: number;
}

interface SitemapRouteEntry {
  path: string;
  changefreq: "daily" | "weekly" | "monthly";
  priority: string;
}

const CORE_ROUTES: SitemapRouteEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/cities", changefreq: "daily", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

const normalizeSiteUrl = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "http://localhost:3000";
  }

  return trimmed.replace(/\/+$/, "");
};

const normalizeApiBase = (value: string): string => {
  return value.trim().replace(/\/+$/, "");
};

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const buildUrlEntry = (loc: string, changefreq: SitemapRouteEntry["changefreq"], priority: string, lastmod: string): string => {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
};

const loadCityPaths = async (apiBase: string): Promise<string[]> => {
  if (apiBase === "") {
    return [];
  }

  const cityPaths = new Set<string>();
  let page = 1;
  let lastPage = 1;

  do {
    const response = await $fetch<SitemapCityResponse>(`${apiBase}/cities`, {
      query: {
        status: "published",
        per_page: 100,
        page,
      },
    });

    for (const city of Array.isArray(response.data) ? response.data : []) {
      const slug = typeof city.slug === "string" ? city.slug.trim() : "";
      if (slug !== "") {
        cityPaths.add(`/cities/${encodeURIComponent(slug)}`);
      }
    }

    const metaLastPage = Number(response.meta?.last_page ?? 0);
    const directLastPage = Number(response.last_page ?? 0);
    lastPage = Math.max(metaLastPage || directLastPage || page, page);
    page += 1;
  } while (page <= lastPage);

  return Array.from(cityPaths);
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = normalizeSiteUrl(String(config.public?.siteUrl ?? ""));
  const apiBase = normalizeApiBase(String(config.public?.apiBase ?? ""));
  const lastmod = new Date().toISOString();

  let cityPaths: string[] = [];
  try {
    cityPaths = await loadCityPaths(apiBase);
  } catch {
    cityPaths = [];
  }

  const entries = [
    ...CORE_ROUTES.map((route) => buildUrlEntry(`${siteUrl}${route.path}`, route.changefreq, route.priority, lastmod)),
    ...cityPaths.map((path) => buildUrlEntry(`${siteUrl}${path}`, "weekly", "0.8", lastmod)),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=300");

  return xml;
});
