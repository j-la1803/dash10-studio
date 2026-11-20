import type { ReactNode } from 'react'
import styles from './Posters.module.css'

/** Real text stays in the heading; the outline is a progressive visual enhancement. */
export function DisplayTitle({ children, outline }: { children?: ReactNode; outline: ReactNode }) {
  return (
    <>
      {children}
      <span className={styles.outline}>{outline}</span>
    </>
  )
}
