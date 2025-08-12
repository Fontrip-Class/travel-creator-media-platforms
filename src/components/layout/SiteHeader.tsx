import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/about", label: "平台介紹" },
  { to: "/for-suppliers", label: "供應商方案" },
  { to: "/for-creators", label: "創作者方案" },
  { to: "/for-media", label: "媒體方案" },
  { to: "/pricing", label: "服務與價格" },
  { to: "/faq", label: "FAQ" },
  { to: "/suppliers", label: "供應商名錄" },
  { to: "/creators", label: "創作者名錄" },
  { to: "/media", label: "媒體名錄" },
  { to: "/admin", label: "管理後台" },
];

const SiteHeader = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary/10" aria-hidden />
          <span className="font-semibold">Travel Creator Media Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button asChild variant="secondary">
            <a href="#contact" aria-label="聯絡我們">聯絡我們</a>
          </Button>
        </nav>

        <button
          className="md:hidden p-2 rounded-md border interactive-shadow"
          aria-label="Open Menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">選單</span>
              <button className="p-2 rounded-md border" onClick={() => setOpen(false)} aria-label="Close Menu">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-sm ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Button asChild variant="secondary" className="w-full">
                <a href="#contact" onClick={() => setOpen(false)}>聯絡我們</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
