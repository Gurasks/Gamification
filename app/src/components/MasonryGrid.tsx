import React, { useEffect, useRef, useState } from 'react';

interface MasonryGridProps {
  children: React.ReactNode[];
  columns?: { sm?: number; md?: number; lg?: number };
  gap?: number;
  className?: string;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 24,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(columns.lg || 3);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setColumnCount(columns.sm || 1);
      } else if (width < 1024) {
        setColumnCount(columns.md || 2);
      } else {
        setColumnCount(columns.lg || 3);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);

    return () => window.removeEventListener('resize', updateColumnCount);
  }, [columns.sm, columns.md, columns.lg]);

  const columnsArray = Array.from({ length: columnCount }, () => [] as React.ReactNode[]);

  children.forEach((child, index) => {
    const columnIndex = index % columnCount;
    columnsArray[columnIndex].push(
      <div key={index} style={{ marginBottom: `${gap}px` }}>
        {child}
      </div>
    );
  });

  return (
    <div ref={containerRef} className={`flex ${className}`} style={{ gap: `${gap}px` }}>
      {columnsArray.map((column, colIndex) => (
        <div key={colIndex} className="flex-1">
          {column}
        </div>
      ))}
    </div>
  );
};

export default MasonryGrid;