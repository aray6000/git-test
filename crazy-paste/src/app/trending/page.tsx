"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiTrendingUp } from "react-icons/fi";

export default function TrendingPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="Trending Pastes"
            as="h1"
            color="primary"
            intensity="low"
            className="text-3xl md:text-4xl font-bold"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          Discover the most popular pastes in the community
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>
              <GlitchText text="Coming Soon" color="secondary" intensity="low" />
            </CardTitle>
            <CardDescription>
              The trending feature is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <FiTrendingUp className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold text-muted-foreground">
                Trending Algorithm in Development
              </h3>
              <p className="mt-2 text-muted-foreground">
                We're working on an advanced algorithm to surface the most popular and engaging pastes.
                Check back soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
