"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { RecentPastes } from "@/components/recent-pastes";
import { Button } from "@/components/ui/button";
import { FiRefreshCw, FiLock } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function RecentPastesPage() {
  const { isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="Recent Pastes"
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
          Browse the latest public pastes from our users
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-4"
        >
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4" />
            Refresh Pastes
          </Button>
        </motion.div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        key={refreshKey}
      >
        <RecentPastes />
      </motion.div>
    </div>
  );
}