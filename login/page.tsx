"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CreatePasteForm } from "@/components/create-paste-form";
import { GlitchText } from "@/components/ui/glitch-text";
import { getPasteById } from "@/lib/paste-service";

export default function NewPastePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're forking an existing paste
  const forkId = searchParams.get("fork");

  useEffect(() => {
    if (forkId) {
      setIsLoading(true);
      const paste = getPasteById(forkId);

      if (!paste) {
        // Paste not found or expired, redirect to new paste page without fork param
        router.push("/new");
      }

      setIsLoading(false);
    }
  }, [forkId, router]);

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

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text={forkId ? "Fork Paste" : "New Paste"}
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
          {forkId ? "Create a new version based on an existing paste" : "Share your code with advanced encryption and styling"}
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CreatePasteForm />
      </motion.div>
    </div>
  );
}
