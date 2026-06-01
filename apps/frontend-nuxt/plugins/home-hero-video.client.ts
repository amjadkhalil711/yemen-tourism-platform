const HERO_VIDEO_SRC = "/images/headers/ye.mp4";

type HeroVideoWindow = Window & {
  __homeHeroVideoPreloader?: HTMLVideoElement;
};

export default defineNuxtPlugin((nuxtApp) => {
  const schedule = (callback: () => void) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 1200 });
      return;
    }

    window.setTimeout(callback, 400);
  };

  const warmHeroVideo = () => {
    if (document.querySelector(`link[data-home-hero-video="${HERO_VIDEO_SRC}"]`)) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "video";
    link.href = HERO_VIDEO_SRC;
    link.type = "video/mp4";
    link.setAttribute("data-home-hero-video", HERO_VIDEO_SRC);
    document.head.appendChild(link);

    const win = window as HeroVideoWindow;
    win.__homeHeroVideoPreloader = document.createElement("video");
    win.__homeHeroVideoPreloader.preload = "auto";
    win.__homeHeroVideoPreloader.muted = true;
    win.__homeHeroVideoPreloader.playsInline = true;
    win.__homeHeroVideoPreloader.src = HERO_VIDEO_SRC;
    win.__homeHeroVideoPreloader.load();
  };

  nuxtApp.hook("app:mounted", () => schedule(warmHeroVideo));
  nuxtApp.hook("page:finish", () => schedule(warmHeroVideo));
});
