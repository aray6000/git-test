"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface AdBoxProps {
  size?: "small" | "medium" | "large" | "banner";
  position?: "sidebar" | "content" | "header" | "footer";
  className?: string;
  title?: string;
  url?: string;
  description?: string;
}

export function AdBox({ 
  size = "medium", 
  position = "content", 
  className = "",
  title = "Your Ad Here",
  url = "#",
  description = "Place your banner or link here"
}: AdBoxProps) {
  const sizeClasses = {
    small: "w-full h-24",
    medium: "w-full h-32", 
    large: "w-full h-48",
    banner: "w-full h-16"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${className}`}
    >
      <Card className={`${sizeClasses[size]} overflow-hidden border-dashed border-2 border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer`}>
        <CardContent className="p-3 h-full flex flex-col justify-center items-center relative">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center mb-2">
              <ExternalLink className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">{title}</span>
            </div>
            {size !== "banner" && size !== "small" && (
              <p className="text-xs opacity-70">{description}</p>
            )}
            {size === "large" && (
              <div className="mt-3 text-xs text-muted-foreground/60">
                Dimensions: {size === "large" ? "300x200" : size === "medium" ? "300x128" : size === "banner" ? "728x64" : "300x96"}
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 text-[10px] opacity-40 bg-muted px-1 rounded">
            Ad Space
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}