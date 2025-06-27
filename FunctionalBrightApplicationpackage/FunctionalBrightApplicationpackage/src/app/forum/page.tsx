
"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiMessageSquare, FiUsers, FiTrendingUp } from "react-icons/fi";

// Particle animation for the background
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${Math.random()}-${Date.now()}-${i}`}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function ForumPage() {
  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto py-16">
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlitchText
              text="FORUM"
              as="h1"
              color="primary"
              intensity="medium"
              className="text-4xl md:text-6xl font-bold mb-4"
              glitchInterval={3000}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Connect with the CrazyPaste community
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-background/50 border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FiMessageSquare className="w-5 h-5" />
                  Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share ideas, get help, and connect with fellow developers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-background/50 border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <FiUsers className="w-5 h-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Join a growing community of passionate developers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-background/50 border-border/30 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <FiTrendingUp className="w-5 h-5" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stay updated with the latest trends and hot topics
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-background/50 border-border/30 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                <GlitchText
                  text="COMING SOON"
                  color="accent"
                  intensity="low"
                  as="h2"
                  className="text-3xl font-bold"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-muted-foreground">
                The CrazyPaste Forum is currently under development
              </p>
              <p className="text-muted-foreground">
                We're working hard to bring you an amazing community experience with:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="text-left">
                  <h4 className="font-semibold text-primary mb-2">Features Coming:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Discussion threads</li>
                    <li>• Code reviews</li>
                    <li>• Help & support</li>
                    <li>• Community challenges</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-secondary mb-2">Community Tools:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• User reputation system</li>
                    <li>• Advanced search</li>
                    <li>• Real-time notifications</li>
                    <li>• Moderation tools</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  🚀 Stay tuned for updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
