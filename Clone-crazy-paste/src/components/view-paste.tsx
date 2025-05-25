"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FiClock, FiEdit, FiEye, FiLock } from "react-icons/fi";
import { toast } from "sonner";
import { CodeEditor } from "./code-editor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { GlitchText } from "./ui/glitch-text";
import { CyberpunkButton } from "./ui/cyberpunk-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Paste } from "@/lib/types";
import { getPasteById, verifyPastePassword } from "@/lib/paste-service";

interface ViewPasteProps {
  pasteId: string;
}

export const ViewPaste: React.FC<ViewPasteProps> = ({ pasteId }) => {
  const router = useRouter();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Fetch the paste data
  useEffect(() => {
    const fetchPaste = () => {
      const pasteData = getPasteById(pasteId);

      if (!pasteData) {
        toast.error("Paste not found or has expired", {
          style: {
            border: "1px solid hsl(var(--destructive))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          },
        });
        router.push("/");
        return;
      }

      // If the paste is password protected and we don't have it yet
      if (pasteData.password && !paste) {
        setIsPasswordDialogOpen(true);
        setIsLoading(false);
        return;
      }

      setPaste(pasteData);
      setIsLoading(false);
    };

    fetchPaste();
  }, [pasteId, router, paste]);

  // Calculate remaining time for pastes with expiration
  useEffect(() => {
    if (!paste || !paste.expires) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const timeLeft = paste.expires! - now;

      if (timeLeft <= 0) {
        setRemainingTime("Expired");
        return;
      }

      // Format the remaining time
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setRemainingTime(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setRemainingTime(`${hours}h ${minutes}m remaining`);
      } else {
        setRemainingTime(`${minutes}m remaining`);
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [paste]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify the password
    const isCorrect = verifyPastePassword(pasteId, passwordInput);

    if (isCorrect) {
      setIsPasswordDialogOpen(false);
      setPaste(getPasteById(pasteId));
    } else {
      setIsPasswordIncorrect(true);
    }
  };

  const handleCreateFork = () => {
    if (!paste) return;

    // Navigate to the create page with the current paste's content pre-filled
    router.push(`/new?fork=${pasteId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-secondary rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isPasswordDialogOpen ? (
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="bg-background/95 backdrop-blur-md border-border/50">
              <DialogHeader>
                <DialogTitle>
                  <GlitchText text="Protected Paste" color="primary" intensity="low" />
                </DialogTitle>
                <DialogDescription>
                  This paste is password protected. Please enter the password to view it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setIsPasswordIncorrect(false);
                      }}
                      className={`bg-muted/50 border-border/50 ${
                        isPasswordIncorrect ? "border-destructive" : ""
                      }`}
                      autoFocus
                    />
                    {isPasswordIncorrect && (
                      <p className="text-destructive text-sm">Incorrect password. Please try again.</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <CyberpunkButton type="submit" glitchOnHover>
                    <FiLock className="mr-2 h-4 w-4" />
                    Unlock
                  </CyberpunkButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          paste && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <Card className="backdrop-blur-sm bg-background/50 border-border/30">
                <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GlitchText
                        text={paste.title || "Untitled Paste"}
                        color="primary"
                        intensity="low"
                        as="h1"
                        className="text-2xl font-bold"
                      />
                      {paste.password && (
                        <FiLock className="text-secondary h-4 w-4" title="Password Protected" />
                      )}
                      {paste.burnAfterReading && (
                        <FiEye className="text-accent h-4 w-4" title="Burn After Reading" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                      <span>Created {format(paste.created, "PPpp")}</span>

                      {paste.expires && (
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          {remainingTime}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <FiEye className="h-3 w-3" />
                        {paste.views} view{paste.views !== 1 ? "s" : ""}
                      </span>
                    </CardDescription>
                  </div>
                  <CyberpunkButton
                    onClick={handleCreateFork}
                    glitchOnHover
                    glowColor="secondary"
                    size="sm"
                    className="mt-2 sm:mt-0"
                  >
                    <FiEdit className="mr-2 h-4 w-4" />
                    Fork
                  </CyberpunkButton>
                </CardHeader>
                <CardContent>
                  <CodeEditor
                    code={paste.content}
                    language={paste.language}
                    title={paste.title || "Untitled"}
                    readOnly={true}
                    showLineNumbers={true}
                  />
                </CardContent>
                {paste.burnAfterReading && (
                  <CardFooter>
                    <div className="w-full p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm">
                      <strong>Warning:</strong> This paste will be deleted after you navigate away from this page.
                    </div>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  );
};
