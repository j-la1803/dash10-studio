import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Dash 10 Studio"
      width={193}
      height={110}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[12rem] w-full h-auto', className)}
      src="/brand/logo/dash10-studio-primary-white.svg"
    />
  )
}
