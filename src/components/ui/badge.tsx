
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        admin: "border-transparent bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-glow hover:from-purple-600 hover:to-pink-600",
        moderator: "border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-glow hover:from-blue-600 hover:to-indigo-600",
        vip: "border-transparent bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-glow hover:from-amber-500 hover:to-yellow-600",
        standard: "border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300",
        online: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        offline: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
