import { defineEventHandler, setHeader } from "h3";

const normalizeSiteUrl = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "http://localhost:3000";
  }

  return trimmed.replace(/\/+$/, "");
};

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = normalizeSiteUrl(String(config.public?.siteUrl ?? ""));

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
});
