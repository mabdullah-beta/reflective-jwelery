"use client"

import Link from "next/link"

type Props = {
  children?: React.ReactNode
  href: string
  className?: string
  "data-testid"?: string
}

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  className,
  ...props
}: Props) => {
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
