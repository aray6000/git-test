"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiCheck, FiClock, FiEye, FiLock, FiPlus, FiShield, FiTerminal, FiUser } from "react-icons/fi";
import { toast } from "sonner";
import { CodeEditor } from "./code-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlitchText } from "@/components/ui/glitch-text";
import { Switch } from "@/components/ui/switch";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createPaste } from "@/lib/paste-service";
import type { CreatePasteInput, ExpirationOption } from "@/lib/types";
import { languages } from "@/lib/languages";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const expirationOptions = [
  { value: "never", label: "Never" },
  { value: "10m", label: "10 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "burn", label: "Burn after reading" },
];

export function CreatePasteForm() {
  const [mounted, setMounted] = useState(false);

  // Handle mounting on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <div>Loading...</div>;
  }

  return <CreatePasteFormContent />;
}

function CreatePasteFormContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [formState, setFormState] = useState<CreatePasteInput>({
    title: "",
    content: "",
    language: "text",
    expiration: "never",
    burnAfterReading: false,
  });
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/auth');
    }
  }, [isAuthenticated, user, router]);

  // Handle fork data loading
  useEffect(() => {
    // Check for fork parameter only on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forkId = urlParams.get('fork');

      if (forkId) {
        try {
          const pastes = JSON.parse(localStorage.getItem('crazy-paste-pastes') || '[]');
          const forkPaste = pastes.find((p: any) => p.id === forkId);

          if (forkPaste) {
            setFormState(prev => ({
              ...prev,
              title: `Fork of ${forkPaste.title}`,
              content: forkPaste.content,
              language: forkPaste.language
            }));
          }
        } catch (error) {
          console.error('Error loading fork data:', error);
        }
      }
    }
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setFormState(prev => ({ ...prev, content: newCode }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formState.content || !formState.content.trim()) {
      toast.error("Content cannot be empty", {
        style: {
          border: "1px solid hsl(var(--destructive))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });
      return;
    }

    if (formState.content.length > 100000) { // 100KB limit
      toast.error("Content is too large. Please reduce the size.", {
        style: {
          border: "1px solid hsl(var(--destructive))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });
      return;
    }

    if (isPasswordProtected && (!formState.password || formState.password.trim().length < 1)) {
      toast.error("Password cannot be empty when password protection is enabled", {
        style: {
          border: "1px solid hsl(var(--destructive))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Process the form data
      const pasteData: CreatePasteInput = {
        title: formState.title?.trim() || "Untitled Paste",
        content: formState.content.trim(),
        language: formState.language || "text",
        expiration: formState.expiration || "never",
        password: isPasswordProtected ? formState.password?.trim() : undefined,
        burnAfterReading: formState.burnAfterReading || false,
      };

      console.log('Creating paste with data:', { ...pasteData, password: pasteData.password ? '[REDACTED]' : undefined });

      // Create the paste
      const paste = createPaste(pasteData);

      toast.success(`Paste "${paste.title}" created successfully!`, {
        style: {
          border: "1px solid hsl(var(--primary))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });

      // Redirect to the paste view page
      router.push(`/paste/${paste.id}`);
    } catch (error) {
      console.error("Error creating paste:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create paste";
      toast.error(errorMessage, {
        style: {
          border: "1px solid hsl(var(--destructive))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, isPasswordProtected, router]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="backdrop-blur-sm bg-background/50 border-border/30">
        <CardHeader>
          <CardTitle>
            <GlitchText
              text="Authentication Required"
              color="primary"
              intensity="low"
              as="h2"
              className="text-2xl font-bold"
            />
          </CardTitle>
          <CardDescription>
            You need to be logged in to create pastes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <FiUser className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Account Required</h3>
            <p className="text-muted-foreground mb-6">
              Only registered users can create and share pastes. Please log in or create an account to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <CyberpunkButton asChild>
                <Link href="/auth">Log In / Sign Up</Link>
              </CyberpunkButton>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="backdrop-blur-sm bg-background/50 border-border/30">
        <CardHeader>
          <CardTitle>
            <GlitchText
              text="Create New Paste"
              color="primary"
              intensity="low"
              as="h2"
              className="text-2xl font-bold"
            />
          </CardTitle>
          <CardDescription>
            Welcome {user?.username}! Share code or text with syntax highlighting and advanced protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FiTerminal className="h-4 w-4 text-secondary" />
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter a title for your paste (optional)"
              value={formState.title}
              onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <FiTerminal className="h-4 w-4 text-secondary" />
              Language
            </Label>
            <Select
              value={formState.language}
              onValueChange={(value) => setFormState(prev => ({ ...prev, language: value }))}
            >
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2">
              <FiTerminal className="h-4 w-4 text-secondary" />
              Content
            </Label>
            <div className="border border-border/50 rounded-lg p-1 bg-muted/10 min-h-[600px]">
              <CodeEditor
                code={formState.content}
                language={formState.language}
                title={formState.title || "Untitled"}
                onCodeChange={handleCodeChange}
                readOnly={false}
                height="580px"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiration" className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-secondary" />
                Expiration
              </Label>
              <Select
                value={formState.expiration}
                onValueChange={(value) => {
                  const expValue = value as ExpirationOption;
                  setFormState(prev => ({
                    ...prev,
                    expiration: expValue,
                    // If "burn after reading" is selected, update burnAfterReading
                    burnAfterReading: expValue === "burn" ? true : (expValue === "never" ? false : prev.burnAfterReading)
                  }));
                }}
              >
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-protected" className="flex items-center gap-2 cursor-pointer">
                  <FiLock className="h-4 w-4 text-secondary" />
                  Password Protected
                </Label>
                <Switch
                  id="password-protected"
                  checked={isPasswordProtected}
                  onCheckedChange={setIsPasswordProtected}
                />
              </div>

              {isPasswordProtected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formState.password || ""}
                    onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-muted/50 border-border/50"
                  />
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="burn-after-reading" className="flex items-center gap-2 cursor-pointer">
                  <FiEye className="h-4 w-4 text-secondary" />
                  Burn After Reading
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FiShield className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>When enabled, this paste will be deleted after it's viewed once.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  id="burn-after-reading"
                  checked={formState.burnAfterReading}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, burnAfterReading: checked }))}
                  disabled={formState.expiration === "burn"}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <CyberpunkButton
            type="submit"
            disabled={isSubmitting}
            glitchOnHover
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Processing</span>
            ) : (
              <span className="flex items-center gap-2">
                <FiPlus className="h-4 w-4" /> Create Paste
              </span>
            )}
          </CyberpunkButton>
        </CardFooter>
      </Card>
    </form>
  );
}