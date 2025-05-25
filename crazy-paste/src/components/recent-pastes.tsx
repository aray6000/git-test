"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { FiClock, FiCode, FiExternalLink } from "react-icons/fi";
import { getRecentPastes } from "@/lib/paste-service";
import type { Paste } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { GlitchText } from "./ui/glitch-text";
import { languages } from "@/lib/languages";

export const RecentPastes: React.FC = () => {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get recent pastes
    const recentPastes = getRecentPastes(10);
    setPastes(recentPastes);
    setIsLoading(false);
  }, []);

  const getLanguageName = (langId: string): string => {
    const language = languages.find(l => l.id === langId);
    return language ? language.name : langId;
  };

  const getExpirationText = (paste: Paste): string => {
    if (!paste.expires) return "Never expires";

    const now = Date.now();
    const timeLeft = paste.expires - now;

    if (timeLeft <= 0) return "Expired";

    // Format the remaining time
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    }
    if (hours > 0) {
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m left`;
    }
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m left`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-secondary rounded-full animate-spin border-t-transparent" />
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (pastes.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-background/50 border-border/30">
        <CardHeader>
          <CardTitle>
            <GlitchText text="Recent Pastes" color="primary" intensity="low" />
          </CardTitle>
          <CardDescription>Browse recently created public pastes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <FiCode className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No recent pastes</h3>
            <p className="mt-2 text-muted-foreground">Be the first to create a paste!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-background/50 border-border/30">
      <CardHeader>
        <CardTitle>
          <GlitchText text="Recent Pastes" color="primary" intensity="low" />
        </CardTitle>
        <CardDescription>Browse recently created public pastes</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {pastes.map((paste) => (
            <motion.div key={paste.id} variants={item}>
              <Link href={`/paste/${paste.id}`} className="block">
                <div className="group relative overflow-hidden rounded-md border border-border/50 bg-muted/30 p-4 transition-all hover:bg-muted/50">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 left-0 h-[1px] w-[100px] bg-gradient-to-r from-primary to-transparent" />
                    <div className="absolute top-0 left-0 h-[100px] w-[1px] bg-gradient-to-b from-primary to-transparent" />
                    <div className="absolute bottom-0 right-0 h-[1px] w-[100px] bg-gradient-to-l from-primary to-transparent" />
                    <div className="absolute bottom-0 right-0 h-[100px] w-[1px] bg-gradient-to-t from-primary to-transparent" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="flex items-center font-medium text-foreground group-hover:text-primary transition-colors">
                        {paste.title}
                        <FiExternalLink className="ml-2 h-3 w-3 opacity-70" />
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {paste.content.substring(0, 100)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center mt-2 sm:mt-0">
                      <Badge variant="outline" className="text-secondary border-secondary/30">
                        {getLanguageName(paste.language)}
                      </Badge>
                      {paste.expires && (
                        <Badge variant="outline" className="flex items-center gap-1 border-muted-foreground/30">
                          <FiClock className="h-3 w-3" />
                          {getExpirationText(paste)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {format(paste.created, "PPp")}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};
