"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain } from "lucide-react"

interface PageLoaderProps {
  isLoading?: boolean
  message?: string
  showProgress?: boolean
}

export function PageLoader({ isLoading = true, message = "Загрузка...", showProgress = true }: PageLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading || !showProgress) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 20
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading, showProgress])

  useEffect(() => {
    if (!isLoading) {
      setProgress(100)
    }
  }, [isLoading])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Animated Logo */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>

              {/* Pulse Ring */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-blue-500 rounded-full"
              />
            </motion.div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                />
              </div>
            )}

            {/* Loading Text */}
            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="text-sm text-muted-foreground font-medium"
            >
              {message}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
