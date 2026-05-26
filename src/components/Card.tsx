import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-[24px] border border-outline-variant bg-surface text-on-surface overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardElevated = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-[24px] bg-surface text-on-surface shadow-md shadow-black/5 overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardFilled = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-[24px] bg-surface-variant text-on-surface-variant overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-[22px] font-medium leading-7 tracking-normal text-on-surface",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({ className, children, ...props }: CardProps) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

