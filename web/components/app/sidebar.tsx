'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Plug,
  Send,
  Settings,
  Users,
  Users2,
  X,
  Zap,
} from 'lucide-react'

import { signOut } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import { planLabel } from '@/lib/content/pricing'
import { Logo } from '@/components/brand/logos'
import { PersonAvatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NAV = [
  { href: '/app/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/app/prospects', label: 'Prospects', Icon: Users },
  { href: '/app/sequences', label: 'Sequences', Icon: Send },
  { href: '/app/inbox', label: 'Inbox', Icon: Inbox, badgeKey: 'unread' as const },
  { href: '/app/content', label: 'Content', Icon: BarChart3 },
  { href: '/app/agents', label: 'Agents', Icon: Zap },
]

const SECONDARY = [
  { href: '/app/integrations', label: 'Integrations', Icon: Plug },
  { href: '/app/team', label: 'Team', Icon: Users2 },
  { href: '/app/settings', label: 'Settings', Icon: Settings },
  { href: '/app/billing', label: 'Billing', Icon: CreditCard },
]

interface SidebarProps {
  userName: string
  userEmail: string
  orgName: string
  plan: string
  unread: number
}

function NavList({ unread, onNavigate }: { unread: number; onNavigate?: () => void }) {
  const pathname = usePathname()

  const item = (
    { href, label, Icon, badgeKey }: { href: string; label: string; Icon: React.ElementType; badgeKey?: 'unread' },
    key: string
  ) => {
    const active = pathname === href || pathname.startsWith(`${href}/`)
    const badge = badgeKey === 'unread' ? unread : 0

    return (
      <li key={key}>
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
            active
              ? 'bg-primary/15 font-medium text-primary'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          )}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
          {badge > 0 && (
            <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {badge}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <nav className="flex-1 space-y-6 px-3" aria-label="Application">
      <ul className="space-y-0.5">{NAV.map((entry) => item(entry, entry.href))}</ul>
      <div>
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
          Workspace
        </p>
        <ul className="space-y-0.5">{SECONDARY.map((entry) => item(entry, entry.href))}</ul>
      </div>
    </nav>
  )
}

function AccountMenu({ userName, userEmail, orgName, plan }: Omit<SidebarProps, 'unread'>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl border border-border bg-card/60 p-2.5 text-left transition-colors hover:bg-secondary/60">
        <PersonAvatar name={userName} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{orgName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{planLabel(plan)}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/billing">
            <CreditCard /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOut} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2 text-left">
              <LogOut className="size-4 text-muted-foreground" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar(props: SidebarProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => setOpen(false), [pathname])

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/app/dashboard">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col gap-4 overflow-y-auto border-t border-border bg-background/98 py-5 backdrop-blur-xl lg:hidden">
          <NavList unread={props.unread} onNavigate={() => setOpen(false)} />
          <div className="px-3">
            <AccountMenu {...props} />
          </div>
        </div>
      )}

      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-5 border-r border-border bg-card/30 py-5 lg:flex">
        <div className="px-5">
          <Link href="/app/dashboard" aria-label="Dashboard">
            <Logo />
          </Link>
        </div>

        <NavList unread={props.unread} />

        <div className="px-3">
          <AccountMenu {...props} />
        </div>
      </aside>
    </>
  )
}
