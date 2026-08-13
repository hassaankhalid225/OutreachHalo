'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { inviteMemberAction, revokeInviteAction } from '@/app/actions/app'
import { formatDate } from '@/lib/utils'
import type { TeamMember } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PersonAvatar } from '@/components/ui/avatar'

export function TeamUpgradePrompt({ planName }: { planName: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card/60 p-8 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Lock className="size-5" />
      </span>
      <h2 className="mt-5 text-lg font-semibold">Shared workspace is on Growth</h2>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        You are on {planName}. Growth adds a shared workspace with up to five seats, so a team can run sequences side by
        side and see each other’s reply rates in one view.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/app/billing">Upgrade to Growth</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/pricing">Compare plans</Link>
        </Button>
      </div>
    </div>
  )
}

export function TeamView({ members, seatLimit }: { members: TeamMember[]; seatLimit: number }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<'admin' | 'member'>('member')
  const [busy, setBusy] = React.useState(false)

  const active = members.filter((m) => m.status === 'active').length
  const atLimit = Number.isFinite(seatLimit) && active >= seatLimit

  async function invite() {
    setBusy(true)
    const result = await inviteMemberAction(email.trim(), role)
    setBusy(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setOpen(false)
    setEmail('')
    toast.success(`Invite sent to ${email}`)
    router.refresh()
  }

  async function revoke(id: string) {
    await revokeInviteAction(id)
    toast.success('Invite revoked')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {active} of {Number.isFinite(seatLimit) ? seatLimit : '∞'} seats used
        </p>
        <Button onClick={() => setOpen(true)} disabled={atLimit}>
          <UserPlus /> Invite member
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={member.full_name ?? member.email ?? '?'} className="size-8" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.full_name ?? 'Pending invite'}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{member.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === 'active' ? 'positive' : 'warm'}>{member.status}</Badge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                  {formatDate(member.created_at)}
                </TableCell>
                <TableCell>
                  {member.status === 'pending' && (
                    <Button variant="ghost" size="icon-sm" onClick={() => revoke(member.id)} aria-label="Revoke invite">
                      <Trash2 />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
        <Mail className="mt-0.5 size-3.5 shrink-0" />
        Invited members get an email with a join link. Admins can edit sequences and connected accounts; members can send
        and reply but cannot change billing.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
            <DialogDescription>They will join this workspace and see the same prospects and sequences.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && invite()}
                placeholder="teammate@company.com"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member — send and reply</SelectItem>
                  <SelectItem value="admin">Admin — full access except billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={invite} loading={busy} disabled={!email.trim()}>
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
