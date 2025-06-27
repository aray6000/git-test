"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/ui/glitch-text";
import { FiClock, FiEye, FiCode, FiUser, FiLock, FiGlobe } from "react-icons/fi";
import { getAllPastes } from "@/lib/paste-service";
import { findUserById } from "@/lib/auth";

interface Paste {
  id: string;
  title: string;
  language: string;
  created: number;
  views: number;
  author: string;
  isPublic: boolean;
  userId?: string;
  password?: string;
}

export function RecentPastes() {
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentPastes = () => {
      try {
        console.log('Loading recent pastes...');

        // Get all pastes from localStorage
        const allPastes = getAllPastes();
        console.log('getAllPastes returned:', allPastes);

        if (!allPastes || allPastes.length === 0) {
          console.log('No pastes found, showing empty state');
          setPastes([]);
          setLoading(false);
          return;
        }

        // Filter for public pastes only (no password protection)
        const publicPastes = allPastes.filter(paste => !paste.password);
        console.log('Public pastes found:', publicPastes.length);

        // Sort by creation date (newest first) and take top 10
        const recentPastes = publicPastes
          .sort((a, b) => b.created - a.created)
          .slice(0, 10)
          .map(paste => {
            // Get author username from user ID
            let authorName = 'Anonymous';
            if (paste.userId) {
              const user = findUserById(paste.userId);
              if (user) {
                authorName = user.username || user.email.split('@')[0];
              }
            }

            return {
              id: paste.id,
              title: paste.title || 'Untitled Paste',
              language: paste.language || 'text',
              created: paste.created,
              views: paste.views || 0,
              author: authorName,
              isPublic: !paste.password,
              userId: paste.userId,
              password: paste.password
            };
          });

        console.log('Recent pastes loaded:', recentPastes.length);
        setPastes(recentPastes);
        setLoading(false);
      } catch (error) {
        console.error('Error loading recent pastes:', error);
        setPastes([]);
        setLoading(false);
      }
    };

    loadRecentPastes();
  }, []);

  return (
    <Card className="backdrop-blur-sm bg-background/50 border-border/30">
      <CardHeader>
        <CardTitle>
          <GlitchText text="Recent Pastes" color="primary" intensity="low" />
        </CardTitle>
        <CardDescription>Browse recently created public pastes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative">
              <div className="h-10 w-10 border-2 border-secondary rounded-full animate-spin border-t-transparent" />
              <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-pulse" />
            </div>
          </div>
        ) : pastes.length === 0 ? (
          <div className="py-8 text-center">
            <FiCode className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-muted-foreground">No recent pastes</h3>
            <p className="mt-2 text-muted-foreground">Be the first to create a paste!</p>
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {pastes.map((paste) => (
              <motion.div
                key={paste.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
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
                          {paste.isPublic ? (
                            <FiGlobe className="ml-2 h-3 w-3 opacity-70" />
                          ) : (
                            <FiLock className="ml-2 h-3 w-3 opacity-70" />
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {paste.language} by {paste.author}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-2 sm:mt-0">
                        <Badge variant="outline" className="flex items-center gap-1 border-muted-foreground/30">
                          <FiEye className="h-3 w-3" />
                          {paste.views} views
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 border-muted-foreground/30">
                          <FiClock className="h-3 w-3" />
                          {new Date(paste.created).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}