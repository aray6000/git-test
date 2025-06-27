"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FiClock, FiEdit, FiEye, FiLock, FiUsers, FiCopy, FiDownload, FiCalendar, FiCode, FiUser, FiGlobe, FiActivity, FiMapPin, FiGithub, FiMessageSquare, FiSend, FiMail } from "react-icons/fi";
import { toast } from "sonner";
import { useLiveViews } from "@/hooks/use-live-views";
import { CodeEditor } from "./code-editor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { GlitchText } from "./ui/glitch-text";
import { CyberpunkButton } from "./ui/cyberpunk-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Paste } from "@/lib/types";
import { getPasteById, verifyPastePassword, incrementPasteViews } from "@/lib/paste-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-json";
import "prismjs/components/prism-xml-doc";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ViewPasteProps {
  pasteId: string;
}

export const ViewPaste: React.FC<ViewPasteProps> = ({ pasteId }) => {
  const router = useRouter();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [hasViewedThisSession, setHasViewedThisSession] = useState(false);
  const { liveViewCount, isConnected } = useLiveViews(pasteId);
  const codeRef = useRef<HTMLDivElement>(null);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the paste data
  useEffect(() => {
    if (!mounted || !pasteId) return;

    const fetchPaste = async () => {
      try {
        // Add a small delay to ensure the page is fully mounted
        await new Promise(resolve => setTimeout(resolve, 100));

        const pasteData = await getPasteById(pasteId);

        if (!pasteData) {
          console.log(`Paste with ID ${pasteId} not found`);
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

        // Fetch the author information (visible to all users)
        if (pasteData.userId) {
          // Try to get real user data from localStorage first
          const userDatabase = JSON.parse(localStorage.getItem('crazy-paste-user-database') || '{}');
          const databaseUsers = userDatabase.users || [];
          const storedUsers = JSON.parse(localStorage.getItem('crazy-paste-users') || '[]');
          
          // Look for user in both databases
          let pasteAuthor = databaseUsers.find((u: any) => u.id === pasteData.userId) || 
                           storedUsers.find((u: any) => u.id === pasteData.userId);
          
          // If not found, create mock data
          if (!pasteAuthor) {
            pasteAuthor = {
              id: pasteData.userId,
              username: 'Anonymous',
              displayName: 'Anonymous User',
              avatar: '',
              bio: 'Paste creator',
              joinDate: new Date().toISOString(),
              location: '',
              website: '',
              github: '',
              discord: '',
              telegram: '',
              twitter: '',
              stats: {
                pastes: 1,
                views: pasteData.views || 0
              }
            };
          }
          
          setAuthor(pasteAuthor);
        }

        // Increment view count only when actually viewing the paste
        if (!hasViewedThisSession) {
          await incrementViewCount();
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching paste:', error);
        toast.error("Failed to load paste", {
          style: {
            border: "1px solid hsl(var(--destructive))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          },
        });
        router.push("/");
        setIsLoading(false);
      }
    };

    const incrementViewCount = async () => {
      try {
        await incrementPasteViews(pasteId);
        setPaste(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);

        // Mark as viewed this session
        sessionStorage.setItem(`viewed_paste_${pasteId}`, 'true');
        setHasViewedThisSession(true);
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    };

    fetchPaste();
  }, [pasteId, router, mounted, paste, hasViewedThisSession]);

  // Calculate remaining time for pastes with expiration
  useEffect(() => {
    if (!paste || !paste.expires) return;

    const updateRemainingTime = () => {
      const now = Date.now();
      const timeLeft = (paste.expires || 0) - now;

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

  const handlePasswordSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify the password
    const isCorrect = await verifyPastePassword(pasteId, passwordInput);

    if (isCorrect) {
      setIsPasswordDialogOpen(false);
      const pasteData = await getPasteById(pasteId);
      setPaste(pasteData);
      // The view count will be incremented by the main useEffect since hasViewedThisSession will be false
    } else {
      setIsPasswordIncorrect(true);
    }
  }, [pasteId, passwordInput]);

  const handleCreateFork = useCallback(() => {
    if (!paste) return;

    // Navigate to the create page with the current paste's content pre-filled
    router.push(`/new?fork=${pasteId}`);
  }, [router, pasteId]);

  const copyToClipboard = useCallback(() => {
    if (paste) {
      navigator.clipboard.writeText(paste.content)
        .then(() => {
          setCopied(true);
          toast.success("Code copied to clipboard!", {
            style: {
              border: "1px solid hsl(var(--primary))",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
            },
          });
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast.error("Failed to copy code to clipboard.", {
            style: {
              border: "1px solid hsl(var(--destructive))",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
            },
          });
        });
    }
  }, [paste]);

  // Highlight code with Prism.js
  useEffect(() => {
    if (paste && codeRef.current) {
      try {
        const code = codeRef.current.textContent;
        const language = paste.language.toLowerCase();
        const highlighted = Prism.highlight(code, Prism.languages[language] || Prism.languages.javascript, language);
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlightedCode(paste.content); // Fallback to plain text
      }
    }
  }, [paste]);

  

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return <div>Loading...</div>;
  }

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
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Box - Left Side */}
        {author && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="bg-background/30 border-border/30 backdrop-blur-sm sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-16 h-16 mb-3 border-2 border-primary/50">
                    <AvatarImage src={author.avatar} alt={author.displayName} />
                    <AvatarFallback className="text-lg bg-primary/20">
                      {author.displayName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-primary">{author.displayName}</h3>
                  <p className="text-sm text-muted-foreground">@{author.username}</p>
                  {author.bio && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{author.bio}</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* User Stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <div className="font-semibold text-primary">{author.stats?.pastes || 0}</div>
                    <div className="text-muted-foreground">Pastes</div>
                  </div>
                  <div>
                    <div className="font-semibold text-secondary">{(author.stats?.views || 0).toLocaleString()}</div>
                    <div className="text-muted-foreground">Views</div>
                  </div>
                </div>

                {/* Contact Links */}
                {(author.website || author.github || author.discord || author.telegram || author.twitter) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase">Contact</h4>
                    <div className="space-y-1">
                      {author.website && (
                        <a href={author.website} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors">
                          <FiGlobe className="w-3 h-3" />
                          Website
                        </a>
                      )}
                      {author.github && (
                        <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors">
                          <FiGithub className="w-3 h-3" />
                          GitHub
                        </a>
                      )}
                      {author.discord && (
                        <a href={author.discord} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-xs text-secondary hover:text-secondary/80 transition-colors">
                          <FiMessageSquare className="w-3 h-3" />
                          Discord
                        </a>
                      )}
                      {author.telegram && (
                        <a href={author.telegram} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors">
                          <FiSend className="w-3 h-3" />
                          Telegram
                        </a>
                      )}
                      {author.twitter && (
                        <a href={author.twitter} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-2 text-xs text-yellow-500 hover:text-yellow-500/80 transition-colors">
                          <FiMail className="w-3 h-3" />
                          X (Twitter)
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    Joined {new Date(author.joinDate).toLocaleDateString()}
                  </div>
                  {author.location && (
                    <div className="flex items-center gap-1">
                      <FiMapPin className="w-3 h-3" />
                      {author.location}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/users/${author.username}`}>
                      <FiUser className="w-3 h-3 mr-1" />
                      View Profile
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <FiUsers className="w-3 h-3 mr-1" />
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <div className={`${author ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
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
                  <Card className="bg-background/50 border-border/30 backdrop-blur-sm">
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

                          {isConnected && liveViewCount > 0 && (
                            <span className="flex items-center gap-1 text-green-500">
                              <FiUsers className="h-3 w-3" />
                              {liveViewCount} viewing now
                            </span>
                          )}
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
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{paste.title}</span>
                        </div>
                        <pre className="bg-black/50 border border-border/30 rounded-lg p-4 overflow-x-auto">
                          <code
                            ref={codeRef}
                            className={`language-${paste.language.toLowerCase()}`}
                            dangerouslySetInnerHTML={{
                              __html: highlightedCode
                            }}
                          />
                        </pre>
                      </div>
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
        </div>
      </div>
    </div>
  );
};