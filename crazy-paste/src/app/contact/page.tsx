"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiGithub, FiMail, FiMessageSquare, FiHeart } from "react-icons/fi";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="Get in Touch"
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
          We'd love to hear from you
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="backdrop-blur-sm bg-background/50 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiGithub className="h-5 w-5 text-primary" />
                GitHub
              </CardTitle>
              <CardDescription>
                Report bugs, request features, or contribute code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                CrazyPaste is open source! Check out our repository for the latest updates,
                report issues, or submit pull requests.
              </p>
              <CyberpunkButton
                glitchOnHover
                glowColor="primary"
                size="sm"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                <FiGithub className="mr-2 h-4 w-4" />
                View Repository
              </CyberpunkButton>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-background/50 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMessageSquare className="h-5 w-5 text-secondary" />
                Discussions
              </CardTitle>
              <CardDescription>
                Join the community conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Have questions, ideas, or want to share your experience? Join our GitHub Discussions
                to connect with other users and developers.
              </p>
              <CyberpunkButton
                glitchOnHover
                glowColor="secondary"
                size="sm"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                <FiMessageSquare className="mr-2 h-4 w-4" />
                Join Discussions
              </CyberpunkButton>
            </CardContent>
          </Card>
        </div>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiMail className="h-5 w-5 text-accent" />
              Direct Contact
            </CardTitle>
            <CardDescription>
              For security issues or private inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Security Issues</h4>
                <p className="text-muted-foreground text-sm">
                  If you discover a security vulnerability, please report it privately.
                  We take security seriously and will respond promptly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Business Inquiries</h4>
                <p className="text-muted-foreground text-sm">
                  For partnership opportunities, sponsorship, or other business-related matters.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("mailto:contact@crazypaste.dev", "_blank")}
                >
                  <FiMail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-1">Bug Reports</h4>
                <p className="text-xs text-muted-foreground">GitHub Issues</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-1">Feature Requests</h4>
                <p className="text-xs text-muted-foreground">GitHub Discussions</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-1">Documentation</h4>
                <p className="text-xs text-muted-foreground">GitHub Wiki</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-1">Changelog</h4>
                <p className="text-xs text-muted-foreground">GitHub Releases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiHeart className="h-5 w-5 text-red-500" />
              Support the Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                CrazyPaste is a free, open-source project. If you find it useful, consider supporting
                its development:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>⭐ Star our GitHub repository</li>
                <li>🐛 Report bugs and suggest improvements</li>
                <li>📝 Contribute code or documentation</li>
                <li>💬 Share CrazyPaste with others</li>
                <li>☕ Buy us a coffee (coming soon)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
