"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { PageLoader } from "./page-loader"

interface PageTransitionWrapperProps {
  children: React.ReactNode
  loadingDelay?: number
}

export function PageTransitionWrapper({ children, loadingDelay = 150 }: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    // Показываем лоадер только если переход занимает больше loadingDelay
    const loadingTimer = setTimeout(() => {
      setIsLoading(true)
    }, loadingDelay)

    const contentTimer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, loadingDelay + 100)

    return () => {
      clearTimeout(loadingTimer)
      clearTimeout(contentTimer)
    }
  }, [pathname, children, loadingDelay])

  return (
    <>
      <PageLoader isLoading={isLoading} message="Загружаем страницу..." />

      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            {displayChildren}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
