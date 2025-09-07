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
      label: "Login",
      href: "/login",
    },
    {
      label: "Login (simple cookie)",
      href: "/login/simple/cookie",
    },
    {
      label: "Login (HttpOnly cookie)",
      href: "/login/httpOnly/cookie",
    },
    {
      label: "Login (HttpOnly + Zustand)",
      href: "/login/zustand-httpOnly",
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
