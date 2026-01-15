import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: number;
  link?: string;
  className?: string;
  testId?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-gray-900',
  trend,
  link,
  className,
  testId
}: StatCardProps) => {
  const content = (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm h-full',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={cn('text-2xl font-semibold mt-1', color)}>
            {value}
          </p>
        </div>
        <div 
          className={cn(
            'p-3 rounded-lg bg-opacity-10',
            {
              'bg-blue-100': color === 'text-blue-600',
              'bg-green-100': color === 'text-green-600',
              'bg-yellow-100': color === 'text-yellow-600',
              'bg-red-100': color === 'text-red-600',
              'bg-purple-100': color === 'text-purple-600',
              'bg-pink-100': color === 'text-pink-600',
              'bg-indigo-100': color === 'text-indigo-600',
              'bg-gray-100': !color || color === 'text-gray-600',
            }
          )}
        >
          <Icon className={cn('h-6 w-6', color)} />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span 
            className={cn('font-medium flex items-center', {
              'text-green-600': trend >= 0,
              'text-red-600': trend < 0,
            })}
          >
            {trend >= 0 ? (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 ml-2">vs last period</span>
        </div>
      )}
      
      {link && (
        <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
          View details
          <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      )}
    </motion.div>
  );

  if (link) {
    return <Link to={link} data-testid={testId}>{content}</Link>;
  }

  return content;
};

export default StatCard;
