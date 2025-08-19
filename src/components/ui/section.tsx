import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "hero" | "gradient";
  backgroundPattern?: boolean;
  children?: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", backgroundPattern = false, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      hero: "bg-hero relative overflow-hidden",
      gradient: "bg-gradient-surface"
    };

    return (
      <section
        ref={ref}
        className={cn(
          "section-padding",
          variantClasses[variant],
          backgroundPattern && "bg-pattern-dots",
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "wide" | "full";
}

const SectionContainer = React.forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      default: "max-w-7xl mx-auto container-padding",
      wide: "max-w-screen-2xl mx-auto container-padding",
      full: "w-full"
    };

    return (
      <div
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      />
    );
  }
);
SectionContainer.displayName = "SectionContainer";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, action, centered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-16",
          centered ? "text-center" : "flex justify-between items-end",
          className
        )}
        {...props}
      >
        <div className={cn(!centered && "flex-1")}>
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold mb-4",
            centered && "text-gradient"
          )}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn(
              "text-xl text-muted-foreground",
              centered && "max-w-2xl mx-auto"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {action && !centered && (
          <div className="ml-8">
            {action}
          </div>
        )}
        {action && centered && (
          <div className="mt-6">
            {action}
          </div>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { Section, SectionContainer, SectionHeader };
