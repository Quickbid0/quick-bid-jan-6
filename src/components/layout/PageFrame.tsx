import React from 'react';

interface PageFrameProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headingClassName?: string;
}

const PageFrame: React.FC<PageFrameProps> = ({
  children,
  title,
  description,
  className = '',
  contentClassName = 'space-y-6',
  headingClassName = 'space-y-2',
}) => {
  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {title && (
          <header className={`flex flex-col ${headingClassName}`.trim()}>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-base text-gray-500 dark:text-gray-300 max-w-3xl">
                {description}
              </p>
            )}
          </header>
        )}
        <div className={`${contentClassName} w-full`.trim()}>{children}</div>
      </div>
    </div>
  );
};

export default PageFrame;
