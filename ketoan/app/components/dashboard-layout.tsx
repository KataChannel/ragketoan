"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Home,
  Settings,
  TrendingUp,
  Building2,
  Search,
  Menu,
  Package,
  Sparkles,
  BookText,
  Bot,
  FileSearch,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar"
import { Separator } from "@/app/components/ui/separator"
import { Button } from "@/app/components/ui/button"

const menuItems = [
  {
    title: "Trang chủ",
    icon: Home,
    href: "/",
  },
  {
    title: "Hóa đơn",
    icon: FileText,
    href: "/hoadon",
  },
  {
    title: "Xuất nhập tồn",
    icon: Package,
    href: "/xuatnhapton",
  },
  {
    title: "Tổng Hợp Sổ",
    icon: BookText,
    href: "/tonghopso",
  },
  {
    title: "Thống kê",
    icon: TrendingUp,
    href: "/thongke",
  },
  {
    title: "Khách hàng",
    icon: Building2,
    href: "/khachhang",
  },
  {
    title: "Chuẩn hóa",
    icon: Sparkles,
    href: "/training",
  },
  {
    title: "Duyệt Mặt Hàng (AI)",
    icon: Bot,
    href: "/ai-mapping",
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/caidat",
  },
  {
    title: "Báo cáo HH Phat",
    icon: FileSearch,
    href: "/xuatnhapton/hoang-huy-phat",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] shrink-0 bg-blue-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden flex flex-col">
            <span className="font-semibold text-sm text-white">Kế Toán</span>
            <span className="text-[10px] text-slate-400">
              Quản lý hóa đơn
            </span>
          </div>
        </div>
        <Separator className="bg-slate-700 group-data-[collapsible=icon]:hidden" />
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <SidebarInput
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="bg-slate-700 group-data-[collapsible=icon]:hidden" />
        <div className="p-2 text-xs text-slate-400 group-data-[collapsible=icon]:hidden">
          © 2025 Kế Toán App
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <SidebarProvider>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 md:hidden dark:border-gray-700 dark:bg-gray-900">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Kế Toán</span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 transition-transform duration-200 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AppSidebar />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <main className="flex-1 min-h-screen pt-14 md:pt-0">
        {/* Desktop Header */}
        <div className="hidden md:flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6 dark:border-gray-700 dark:bg-gray-900">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6 bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <h1 className="text-base lg:text-lg font-semibold">Quản lý Hóa đơn Điện tử</h1>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-4 lg:p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
