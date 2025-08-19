import * as React from "react";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  structuredData?: object;
  className?: string;
  containerSize?: "default" | "wide" | "full";
}

export function PageLayout({
  children,
  title,
  description,
  structuredData,
  className,
  containerSize = "default"
}: PageLayoutProps) {
  const containerClasses = {
    default: "container max-w-7xl mx-auto px-4",
    wide: "container max-w-screen-2xl mx-auto px-4",
    full: "w-full"
  };

  return (
    <main className={cn("min-h-screen", className)}>
      {title && (
        <SEO
          title={title}
          description={description}
          structuredData={structuredData}
        />
      )}
      <div className={containerClasses[containerSize]}>
        {children}
      </div>
    </main>
  );
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  actions?: React.ReactNode;
  variant?: "default" | "gradient" | "image";
  className?: string;
}

export function PageHero({
  title,
  subtitle,
  image,
  imageAlt,
  actions,
  variant = "default",
  className
}: PageHeroProps) {
  const variantClasses = {
    default: "bg-muted/30",
    gradient: "bg-hero relative overflow-hidden",
    image: "relative min-h-[60vh] overflow-hidden"
  };

  return (
    <section className={cn("py-20", variantClasses[variant], className)}>
      {image && variant === "image" && (
        <>
          <div className="absolute inset-0">
            <img
              src={image}
              alt={imageAlt || title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="absolute inset-0 bg-gradient-overlay" />
        </>
      )}
      
      <div className={cn(
        "container max-w-4xl mx-auto px-4 text-center",
        variant === "image" && "relative z-10 text-white"
      )}>
        <h1 className={cn(
          "text-4xl md:text-6xl font-bold leading-tight mb-6",
          variant === "gradient" && "text-white",
          variant === "default" && "text-gradient"
        )}>
          {title}
        </h1>
        
        {subtitle && (
          <p className={cn(
            "text-xl md:text-2xl mb-8",
            variant === "image" && "text-white/90",
            variant === "gradient" && "text-white/90",
            variant === "default" && "text-muted-foreground"
          )}>
            {subtitle}
          </p>
        )}
        
        {actions && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
