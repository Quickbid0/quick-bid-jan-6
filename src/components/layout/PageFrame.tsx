import React from 'react';
import { motion } from 'framer-motion';

interface PageFrameProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headingClassName?: string;
  isLoading?: boolean;
  variant?: 'default' | 'hero' | 'compact';
  background?: 'default' | 'gradient' | 'subtle';
}

const PageFrame: React.FC<PageFrameProps> = ({
  children,
  title,
  description,
  className = '',
  contentClassName = 'space-y-6',
  headingClassName = 'space-y-2',
  isLoading = false,
  variant = 'default',
  background = 'default',
}) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900';
      case 'subtle':
        return 'bg-gray-50/50 dark:bg-gray-800/50';
      default:
        return 'bg-white dark:bg-gray-900';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'hero':
        return 'py-20 lg:py-24';
      case 'compact':
        return 'py-6';
      default:
        return 'py-10';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${getBackgroundClasses()} ${className}`.trim()}>
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full ${getBackgroundClasses()} ${className}`.trim()}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 ${getVariantClasses()}`}>
        {title && (
          <motion.header
            className={`flex flex-col ${headingClassName}`.trim()}
            variants={itemVariants}
          >
            <motion.h1
              className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight"
              variants={itemVariants}
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p
                className="text-base text-gray-500 dark:text-gray-300 max-w-3xl"
                variants={itemVariants}
              >
                {description}
              </motion.p>
            )}
          </motion.header>
        )}
        <motion.div
          className={`${contentClassName} w-full`.trim()}
          variants={itemVariants}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PageFrame;
