"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CreatePasteForm } from "@/components/create-paste-form";
import { GlitchText } from "@/components/ui/glitch-text";
import { AdBox } from "@/components/ui/ad-box";
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
    <div className="container mx-auto px-4 py-8">
        <AdBox size="banner" position="header" className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CreatePasteForm />
            </div>

            <div className="lg:col-span-1 space-y-4">
              <AdBox size="medium" position="sidebar" />
              <AdBox size="small" position="sidebar" />
            </div>
          </div>
        </motion.div>
      </div>
  );
}