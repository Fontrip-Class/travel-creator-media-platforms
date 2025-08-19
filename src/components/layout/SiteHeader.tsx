import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navigationMenuTriggerStyle = () =>
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

export default function SiteHeader() {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold">旅遊創作者平台</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>解決方案</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-3">
                    <NavLink to="/for-suppliers" className="block rounded-md p-3 hover:bg-muted">
                      <div className="text-sm font-medium">供應商方案</div>
                      <p className="text-xs text-muted-foreground">任務驅動行銷建立</p>
                    </NavLink>
                    <NavLink to="/for-creators" className="block rounded-md p-3 hover:bg-muted">
                      <div className="text-sm font-medium">創作者方案</div>
                      <p className="text-xs text-muted-foreground">素材下載創作</p>
                    </NavLink>
                    <NavLink to="/for-media" className="block rounded-md p-3 hover:bg-muted" aria-label="媒體方案">
                      <div className="text-sm font-medium">媒體方案</div>
                      <p className="text-xs text-muted-foreground">素材下載創作</p>
                    </NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>探索</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-3">
                    <NavLink to="/suppliers" className="block rounded-md p-3 hover:bg-muted">供應商列表</NavLink>
                    <NavLink to="/creators" className="block rounded-md p-3 hover:bg-muted">創作者列表</NavLink>
                    <NavLink to="/media" className="block rounded-md p-3 hover:bg-muted">媒體列表</NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/about" className={navigationMenuTriggerStyle()}>
                  關於平台
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/pricing" className={navigationMenuTriggerStyle()}>
                  價格方案
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/faq" className={navigationMenuTriggerStyle()}>
                  FAQ
                </NavLink>
              </NavigationMenuItem>
              {isAuthenticated ? (
                <NavigationMenuItem>
                  <NavLink to="/admin" className={navigationMenuTriggerStyle()}>
                    管理後台
                  </NavLink>
                </NavigationMenuItem>
              ) : null}
            </NavigationMenuList>
          </NavigationMenu>
          {/* 用戶認證區域 */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button onClick={logout} variant="ghost" size="sm">
                登出
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">登入</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">註冊</Link>
                </Button>
              </>
            )}
          </div>

          <Button asChild variant="secondary">
            <a href="#contact" aria-label="聯絡我們">聯絡我們</a>
          </Button>
                </div>

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
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">解決方案</div>
                <div className="flex flex-col gap-2">
                  <NavLink to="/for-suppliers" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>供應商方案</NavLink>
                  <NavLink to="/for-creators" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>創作者方案</NavLink>
                  <NavLink to="/for-media" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>媒體方案</NavLink>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">探索</div>
                <div className="flex flex-col gap-2">
                  <NavLink to="/suppliers" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>供應商列表</NavLink>
                  <NavLink to="/creators" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>創作者列表</NavLink>
                  <NavLink to="/media" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>媒體列表</NavLink>
                </div>
              </div>
              {/* 用戶認證區域 */}
              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button onClick={logout} variant="ghost" size="sm" className="w-full justify-start">
                    登出
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                      <Link to="/login" onClick={() => setOpen(false)}>登入</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full justify-start">
                      <Link to="/register" onClick={() => setOpen(false)}>註冊</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
