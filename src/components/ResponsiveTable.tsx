import React from 'react';

/**
 * FIX 23: Auction Table Overflow on Mobile
 * Wraps tables to allow horizontal scroll on <768px
 * Prevents table cells from overflowing
 */

interface ResponsiveTableProps {
  children: React.ReactNode;
  minWidth?: string; // Default: 640px (min-w-[640px])
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  minWidth = 'min-w-[640px]',
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className={`${minWidth} w-full text-sm`}>
        {children}
      </table>
    </div>
  );
};

// Example usage:
// <ResponsiveTable>
//   <thead>
//     <tr>
//       <th>Column 1</th>
//       <th>Column 2</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <td>Data 1</td>
//       <td>Data 2</td>
//     </tr>
//   </tbody>
// </ResponsiveTable>
