"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Upload,
  History,
  BarChart3,
  Database,
  Menu,
  Code,
  Sparkles,
  Bell,
  Settings,
  User,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  {
    name: "Upload",
    href: "/",
    icon: Upload,
    description: "Upload CSV files",
    color: "text-cyan-600",
  },
  {
    name: "History",
    href: "/history",
    icon: History,
    description: "View job history",
    color: "text-blue-600",
  },
  {
    name: "Analytics",
    href: "/admin",
    icon: BarChart3,
    description: "Performance metrics",
    color: "text-emerald-600",
  },
  {
    name: "Data",
    href: "/stores",
    icon: Database,
    description: "Manage records",
    color: "text-purple-600",
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3) // Mock notification count

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white/80 backdrop-blur-sm border-b border-gray-200/30",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: AT.dev Brand */}
          <a
            href="https://www.linkedin.com/in/ankittripathi-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group"
          >
            {/* AT.dev Logo */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <span className="text-white font-bold text-lg">AT</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <Code className="h-2 w-2 text-white" />
              </div>
            </div>

            {/* Brand Text */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  AT.dev
                </span>
                <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-cyan-50 rounded-full">
                  <Sparkles className="h-3 w-3 text-cyan-600" />
                  <span className="text-xs font-medium text-cyan-700">Bulk Uploader</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 hidden lg:block">Full Stack Developer</p>
            </div>
          </a>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:shadow-xl"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : item.color)} />
                    {item.name}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right: Actions & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications - Desktop only */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4 text-gray-600" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-600" />
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
                    <a
                      href="https://www.linkedin.com/in/ankittripathi-dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                        <span className="text-white font-bold text-xl">AT</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                          AT.dev
                        </h2>
                        <p className="text-sm text-gray-600">Full Stack Developer</p>
                      </div>
                    </a>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                          <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            <div
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-xl transition-all duration-200",
                                isActive
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                                  : "text-gray-700 hover:bg-gray-50",
                              )}
                            >
                              <Icon className={cn("h-5 w-5", isActive ? "text-white" : item.color)} />
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className={cn("text-sm", isActive ? "text-cyan-100" : "text-gray-500")}>
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Mobile Actions */}
                    <div className="mt-8 pt-6 border-t space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                        {notifications > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {notifications}
                          </Badge>
                        )}
                      </Button>

                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>

                      <Button variant="outline" className="w-full justify-start gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Footer */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Developed by</p>
                      <p className="text-sm font-semibold text-gray-900">Ankit Tripathi</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-sm flex items-center justify-center">
                          <span className="text-white font-bold text-xs">AT</span>
                        </div>
                        <span className="text-xs font-medium text-cyan-600">AT.dev</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Progress bar for active uploads (optional) */}
      <div className="h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 transition-opacity duration-300" />
    </nav>
  )
}
