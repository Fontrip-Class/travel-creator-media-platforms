import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card" | "avatar" | "button";
  lines?: number;
}

export function LoadingSkeleton({ 
  className, 
  variant = "text", 
  lines = 1, 
  ...props 
}: LoadingSkeletonProps) {
  const baseClass = "animate-pulse bg-muted rounded";
  
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClass,
              "h-4",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
              className
            )}
          />
        ))}
      </div>
    );
  }

  const variants = {
    text: "h-4 w-full",
    card: "h-48 w-full",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24",
  };

  return (
    <div
      className={cn(baseClass, variants[variant], className)}
      {...props}
    />
  );
}