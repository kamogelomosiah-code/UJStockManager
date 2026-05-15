import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-[#E5E5E5] bg-white text-card-foreground shadow-sm",
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
      "text-2xl font-semibold leading-none tracking-tight",
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

