/**
 * framer-motion mock for vitest/jsdom
 * Replaces animated components with plain HTML equivalents so
 * React 19 + jsdom doesn't crash on DOM API calls framer-motion needs.
 */
import React from 'react'
import { vi } from 'vitest'

// Factory: create a simple forwardRef component that renders an <Tag>
const makeMotionComponent = (tag: string) =>
  React.forwardRef(({ children, ...rest }: any, ref: any) => {
    // Strip framer-specific props that would cause React unknown-prop warnings
    const {
      initial, animate, exit, transition, variants, whileHover, whileTap,
      whileFocus, whileInView, layoutId, layout, drag, dragConstraints,
      onAnimationComplete, onLayoutAnimationComplete, ...htmlProps
    } = rest
    return React.createElement(tag, { ...htmlProps, ref }, children)
  })

const motion: Record<string, any> = new Proxy({} as Record<string, any>, {
  get: (_target, prop: string) => makeMotionComponent(prop),
})

const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children)

export { motion, AnimatePresence }
export const useAnimation = vi.fn(() => ({ start: vi.fn(), stop: vi.fn() }))
export const useMotionValue = vi.fn((initial: any) => ({ get: () => initial, set: vi.fn() }))
export const useTransform = vi.fn(() => ({ get: vi.fn() }))
export const useSpring = vi.fn((val: any) => val)
export const useScroll = vi.fn(() => ({ scrollY: { get: vi.fn() } }))
export const useInView = vi.fn(() => [null, false])
