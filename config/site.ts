export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Register",
      href: "/register",
    },
    {
      label: "LocalStore",
      href: "/login",
    },
    {
      label: "Cookie",
      href: "/login/simple/cookie",
    },
    {
      label: "HttpOnly",
      href: "/login/httpOnly/cookie",
    },
    {
      label: "Blacklist",
      href: "/login/test/blacklist",
    },
    {
      label: "HttpOnly + Zustand",
      href: "/login/zustand-httpOnly",
    },
    {
      label: "Session",
      href: "/login/session",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
};
