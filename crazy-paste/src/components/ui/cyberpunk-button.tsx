"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export interface CyberpunkButtonProps extends ButtonProps {
  glowColor?: "primary" | "secondary" | "accent" | "destructive";
  glitchOnHover?: boolean;
  cornerAccent?: boolean;
}

const CyberpunkButton = React.forwardRef<HTMLButtonElement, CyberpunkButtonProps>(
  ({ className, glowColor = "primary", glitchOnHover = false, cornerAccent = true, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isGlitching, setIsGlitching] = React.useState(false);

    React.useEffect(() => {
      if (isHovered && glitchOnHover) {
        const timeout = setTimeout(() => {
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 500);
        }, 300);
        return () => clearTimeout(timeout);
      }
    }, [isHovered, glitchOnHover]);

    const getGlowClasses = () => {
      switch (glowColor) {
        case "primary":
          return "before:bg-primary/20 before:shadow-primary/10";
        case "secondary":
          return "before:bg-secondary/20 before:shadow-secondary/10";
        case "accent":
          return "before:bg-accent/20 before:shadow-accent/10";
        case "destructive":
          return "before:bg-destructive/20 before:shadow-destructive/10";
        default:
          return "before:bg-primary/20 before:shadow-primary/10";
      }
    };

    return (
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          x: isGlitching ? [0, -3, 5, -2, 0] : 0,
          y: isGlitching ? [0, 2, -4, 1, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <Button
          className={cn(
            "relative overflow-hidden transition-all border-0",
            "before:absolute before:inset-0 before:opacity-0 before:transition-opacity hover:before:opacity-100",
            "focus-visible:ring-1 focus-visible:ring-offset-1",
            glowColor === "primary" && "text-primary-foreground",
            getGlowClasses(),
            className
          )}
          ref={ref}
          {...props}
        />

        {cornerAccent && (
          <>
            <span className={cn(
              "absolute top-0 left-0 w-2 h-2 border-t border-l opacity-70",
              glowColor === "primary" && "border-primary",
              glowColor === "secondary" && "border-secondary",
              glowColor === "accent" && "border-accent",
              glowColor === "destructive" && "border-destructive",
            )}/>
            <span className={cn(
              "absolute bottom-0 right-0 w-2 h-2 border-b border-r opacity-70",
              glowColor === "primary" && "border-primary",
              glowColor === "secondary" && "border-secondary",
              glowColor === "accent" && "border-accent",
              glowColor === "destructive" && "border-destructive",
            )}/>
          </>
        )}
      </motion.div>
    );
  }
);

CyberpunkButton.displayName = "CyberpunkButton";

export { CyberpunkButton };
