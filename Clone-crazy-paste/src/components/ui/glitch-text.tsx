"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
  color?: "primary" | "secondary" | "accent" | "default";
  intensity?: "low" | "medium" | "high";
  as?: React.ElementType;
  glitchOnHover?: boolean;
  glitchInterval?: number;
  children?: React.ReactNode;
}

export const GlitchText = ({
  text,
  className,
  color = "primary",
  intensity = "medium",
  as: Component = "span",
  glitchOnHover = false,
  glitchInterval = 0,
  children,
}: GlitchTextProps) => {
  const [isGlitching, setIsGlitching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle automatic glitch interval
  useEffect(() => {
    if (glitchInterval > 0 && !glitchOnHover) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 500);
      }, glitchInterval);
      return () => clearInterval(interval);
    }
  }, [glitchInterval, glitchOnHover]);

  // Handle hover-triggered glitch
  useEffect(() => {
    if (glitchOnHover && isHovered) {
      setIsGlitching(true);
      const timeout = setTimeout(() => setIsGlitching(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isHovered, glitchOnHover]);

  const getIntensityValues = () => {
    switch (intensity) {
      case "low":
        return {
          delay: 0.1,
          speed: 0.05,
          offset: 2,
          charDelay: 0.02,
        };
      case "high":
        return {
          delay: 0.03,
          speed: 0.02,
          offset: 5,
          charDelay: 0.01,
        };
      case "medium":
      default:
        return {
          delay: 0.05,
          speed: 0.03,
          offset: 3,
          charDelay: 0.015,
        };
    }
  };

  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "text-primary neon-text";
      case "secondary":
        return "text-secondary neon-text-cyan";
      case "accent":
        return "text-accent neon-text-magenta";
      case "default":
      default:
        return "text-foreground";
    }
  };

  const intensityValues = getIntensityValues();
  const colorClass = getColorClass();

  return (
    <Component
      className={cn("relative inline-block", colorClass, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-text={text}
    >
      <span className="relative z-10 mix-blend-screen">
        {text.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            initial={{ y: 0, x: 0, opacity: 1 }}
            animate={
              isGlitching
                ? {
                    y: [0, -intensityValues.offset, intensityValues.offset, 0],
                    x: [0, intensityValues.offset, -intensityValues.offset, 0],
                    opacity: [1, 0.8, 0.8, 1],
                  }
                : { y: 0, x: 0, opacity: 1 }
            }
            transition={{
              duration: intensityValues.speed,
              delay: index * intensityValues.charDelay,
              ease: "easeInOut",
            }}
            style={{ display: "inline-block" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
      {children}
    </Component>
  );
};
