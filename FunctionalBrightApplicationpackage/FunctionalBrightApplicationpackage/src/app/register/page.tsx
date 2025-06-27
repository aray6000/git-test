"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiCopy, FiEye, FiKey, FiLock, FiPlus, FiRefreshCw, FiShield, FiTerminal } from "react-icons/fi";
import ParallaxTilt from "react-parallax-tilt";
import { GlitchText } from "@/components/ui/glitch-text";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { RecentPastes } from "@/components/recent-pastes";

// Particle animation for the hero section
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`particle-${Math.random()}-${Date.now()}-${i}`}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        <ParticleBackground />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlitchText
              text="CRAZYPASTE"
              as="h1"
              color="primary"
              intensity="medium"
              className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4"
              glitchInterval={5000}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8"
          >
            Share code and text with advanced syntax highlighting and next-gen encryption in a cyberpunk-inspired environment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <CyberpunkButton
              size="lg"
              onClick={() => router.push("/new")}
              glitchOnHover
              className="min-w-[180px]"
            >
              <FiPlus className="mr-2 h-5 w-5" />
              Create Paste
            </CyberpunkButton>

            <CyberpunkButton
              size="lg"
              variant="outline"
              onClick={() => router.push("/recent")}
              glowColor="secondary"
              className="min-w-[180px]"
            >
              <FiEye className="mr-2 h-5 w-5" />
              Browse Pastes
            </CyberpunkButton>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <GlitchText
            text="CUTTING-EDGE FEATURES"
            as="h2"
            color="secondary"
            intensity="low"
            className="text-2xl md:text-3xl font-bold mb-4"
          />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed for developers, cryptographers, and cyberpunks. Share code with unprecedented style and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ParallaxTilt
              key={feature.title}
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.1}
              glareColor="hsl(var(--primary))"
              glarePosition="all"
              glareBorderRadius="8px"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="backdrop-blur-sm bg-background/50 border border-border/30 rounded-lg p-6 h-full neon-outline"
                style={{
                  boxShadow: "0 0 20px -5px hsla(var(--primary), 0.2)",
                  transition: "all 0.3s ease"
                }}
              >
                <div className="mb-4 text-secondary">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            </ParallaxTilt>
          ))}
        </div>
      </section>

      {/* Recent Pastes Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <GlitchText
            text="RECENT PASTES"
            as="h2"
            color="accent"
            intensity="low"
            className="text-2xl md:text-3xl font-bold mb-4"
          />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Check out the latest public pastes from our users
          </p>
        </div>

        <RecentPastes />
      </section>
    </div>
  );
}

const features = [
  {
    title: "Syntax Highlighting",
    description: "Support for over 30 programming languages with beautiful syntax highlighting.",
    icon: FiTerminal,
  },
  {
    title: "Password Protection",
    description: "Secure your pastes with password protection for sensitive data.",
    icon: FiLock,
  },
  {
    title: "Burn After Reading",
    description: "Create self-destructing pastes that vanish after being viewed once.",
    icon: FiEye,
  },
  {
    title: "Expiration Control",
    description: "Set custom expiration times for your pastes, from minutes to months.",
    icon: FiRefreshCw,
  },
  {
    title: "Encryption",
    description: "Client-side encryption ensures your data remains private and secure.",
    icon: FiShield,
  },
  {
    title: "Fork & Edit",
    description: "Easily create a new version from any existing paste with one click.",
    icon: FiCopy,
  },
];