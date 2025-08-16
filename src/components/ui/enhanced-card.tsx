import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "gradient" | "glass";
  gradientType?: "supplier" | "creator" | "media" | "hero";
  children?: React.ReactNode;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", gradientType, children, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300";
    
    const variantClasses = {
      default: "card-enhanced",
      interactive: "card-interactive",
      gradient: `card-enhanced before:absolute before:inset-0 before:opacity-5 hover:before:opacity-10 before:transition-opacity ${
        gradientType ? `before:bg-gradient-${gradientType}` : "before:bg-gradient-hero"
      }`,
      glass: "glass border-border/30 shadow-floating"
    };

    return (
      <Card
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { centered?: boolean }
>(({ className, centered = false, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn(
      "relative z-10",
      centered && "text-center",
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn("relative z-10", className)}
    {...props}
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }
>(({ className, gradient = false, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      gradient && "text-gradient",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardContent,
  EnhancedCardTitle,
  CardDescription as EnhancedCardDescription
};