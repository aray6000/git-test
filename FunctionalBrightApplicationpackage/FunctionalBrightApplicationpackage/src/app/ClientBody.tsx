
"use client";

import { useEffect, useState } from "react";
import { FiCode, FiCopy, FiEye, FiPlusCircle, FiUser, FiLogOut, FiUsers } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdBox } from "@/components/ui/ad-box";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, user, logout, hasPermission } = useAuth();
  const router = useRouter();

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      router.push('/auth');
    } else {
      router.push('/profile');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <header className="relative border-b border-muted/20 backdrop-blur-sm bg-background/80 z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                <FiCode className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-primary">
                CodePaste
              </h1>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/recent" className="flex items-center space-x-1">
                  <FiEye className="h-4 w-4" />
                  <span>Recent</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/trending" className="flex items-center space-x-1">
                  <FiCopy className="h-4 w-4" />
                  <span>Trending</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/users" className="flex items-center space-x-1">
                  <FiUsers className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </Link>
              </Button>
              {hasPermission('canAccessAdminPanel') && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin" className="flex items-center space-x-1">
                    <FiUser className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={handleProfileClick}
              >
                <FiUser className="h-4 w-4 mr-1" />
                <span>Profile</span>
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                  onClick={handleLogout}
                >
                  <FiLogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </Button>
              )}

              <Button asChild variant="default" size="sm" className="bg-primary/90 hover:bg-primary neon-outline">
                <Link href="/new" className="flex items-center space-x-1">
                  <FiPlusCircle className="h-4 w-4" />
                  <span>New Paste</span>
                </Link>
              </Button>
            </nav>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            className="flex-1 container mx-auto px-4 py-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Footer Ad */}
        <div className="container mx-auto px-4 py-4">
          <AdBox size="banner" position="footer" />
        </div>

        <footer className="border-t border-muted/20 backdrop-blur-sm bg-background/80 py-4">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <FiCode className="h-4 w-4" />
              <span>CodePaste © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/api" className="hover:text-foreground transition-colors">
                API
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
