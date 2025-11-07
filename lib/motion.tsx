"use client"

import { motion } from "framer-motion"
import * as React from "react"

export const fadeIn = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.85, 0.25, 1] } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.25 } },
}

export const slideLeft = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.2, 0.85, 0.25, 1] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.25 } },
}

export const spring = (d = 0.5) => ({ type: "spring", stiffness: 700, damping: 30, duration: d })

export const MotionDiv = (props: React.ComponentProps<typeof motion.div>) => (
  <motion.div {...props} />
)

export default MotionDiv
