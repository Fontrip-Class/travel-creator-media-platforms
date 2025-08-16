import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Navigation grouped using NavigationMenu: 方案、名錄、與一般連結

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
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>方案</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-3">
                    <NavLink to="/for-suppliers" className="block rounded-md p-3 hover:bg-muted" aria-label="供應商方案">
                      <div className="text-sm font-medium">供應商方案</div>
                      <p className="text-xs text-muted-foreground">發佈任務、媒合創作者</p>
                    </NavLink>
                    <NavLink to="/for-creators" className="block rounded-md p-3 hover:bg-muted" aria-label="創作者方案">
                      <div className="text-sm font-medium">創作者方案</div>
                      <p className="text-xs text-muted-foreground">申請合作、建立作品</p>
                    </NavLink>
                    <NavLink to="/for-media" className="block rounded-md p-3 hover:bg-muted" aria-label="媒體方案">
                      <div className="text-sm font-medium">媒體方案</div>
                      <p className="text-xs text-muted-foreground">搜尋下載素材</p>
                    </NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>名錄</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-3">
                    <NavLink to="/suppliers" className="block rounded-md p-3 hover:bg-muted">供應商名錄</NavLink>
                    <NavLink to="/creators" className="block rounded-md p-3 hover:bg-muted">創作者名錄</NavLink>
                    <NavLink to="/media" className="block rounded-md p-3 hover:bg-muted">媒體名錄</NavLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink to="/about" className={navigationMenuTriggerStyle()}>
                  關於我們
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/pricing" className={navigationMenuTriggerStyle()}>
                  服務與價格
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/faq" className={navigationMenuTriggerStyle()}>
                  FAQ
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/admin" className={navigationMenuTriggerStyle()}>
                  管理後台
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* 用戶認證按鈕 */}
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">登入</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">註冊</Link>
            </Button>
          </div>
          
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
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">方案</div>
                <div className="flex flex-col gap-2">
                  <NavLink to="/for-suppliers" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>供應商方案</NavLink>
                  <NavLink to="/for-creators" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>創作者方案</NavLink>
                  <NavLink to="/for-media" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>媒體方案</NavLink>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">名錄</div>
                <div className="flex flex-col gap-2">
                  <NavLink to="/suppliers" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>供應商名錄</NavLink>
                  <NavLink to="/creators" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>創作者名錄</NavLink>
                  <NavLink to="/media" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>媒體名錄</NavLink>
                </div>
              </div>
              {/* 用戶認證選項 */}
              <div className="flex flex-col gap-2">
                <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                  <Link to="/login" onClick={() => setOpen(false)}>登入</Link>
                </Button>
                <Button asChild size="sm" className="w-full justify-start">
                  <Link to="/register" onClick={() => setOpen(false)}>註冊</Link>
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <NavLink to="/about" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>關於我們</NavLink>
                <NavLink to="/pricing" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>服務與價格</NavLink>
                <NavLink to="/faq" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>FAQ</NavLink>
                <NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => `text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>管理後台</NavLink>
              </div>
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
