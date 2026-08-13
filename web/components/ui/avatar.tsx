'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn, hashHue, initials } from '@/lib/utils'

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn('aspect-square size-full object-cover', className)} {...props} />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn('flex size-full items-center justify-center rounded-full bg-muted text-xs font-semibold', className)}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/**
 * Person avatar with no network dependency: if there is no `src`, it renders a
 * deterministic two-tone gradient derived from the name plus their initials.
 * Same person → same colour, everywhere in the app, forever.
 */
function PersonAvatar({
  name,
  src,
  className,
  ring = false,
}: {
  name: string
  src?: string | null
  className?: string
  ring?: boolean
}) {
  const hue = hashHue(name)

  return (
    <Avatar className={cn(ring && 'ring-2 ring-background', className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback
        className="text-white"
        style={{
          backgroundImage: `linear-gradient(140deg, hsl(${hue} 62% 46%), hsl(${(hue + 42) % 360} 68% 32%))`,
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export { Avatar, AvatarImage, AvatarFallback, PersonAvatar }
