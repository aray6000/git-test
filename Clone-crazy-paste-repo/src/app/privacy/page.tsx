"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="Privacy Policy"
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
          Your privacy is important to us
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Data Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                CrazyPaste is designed with privacy in mind. We collect minimal data to provide our service:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>No personal information is collected or stored on our servers</li>
                <li>All pastes are stored locally in your browser's localStorage</li>
                <li>We do not use cookies or tracking technologies</li>
                <li>No analytics or third-party tracking services are used</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Local Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                Your pastes are stored locally in your browser using localStorage. This means:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Data never leaves your device unless you share a paste URL</li>
                <li>Clearing your browser data will delete all your pastes</li>
                <li>Different browsers/devices have separate storage</li>
                <li>We cannot recover lost pastes - please backup important content</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Encryption & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                We implement security measures to protect your content:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Password-protected pastes are encrypted client-side</li>
                <li>Encryption keys never leave your browser</li>
                <li>Burn-after-reading pastes are automatically deleted</li>
                <li>All communication uses HTTPS encryption</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Public Pastes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Non-password-protected pastes may appear in the "Recent Pastes" section and are
              accessible to anyone with the direct URL. Do not include sensitive information
              in public pastes.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                CrazyPaste uses the following third-party libraries for functionality:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Shiki for syntax highlighting (runs locally)</li>
                <li>Framer Motion for animations (runs locally)</li>
                <li>Date-fns for date formatting (runs locally)</li>
              </ul>
              <p>
                These libraries do not collect or transmit any personal data.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Changes to Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the service constitutes acceptance of
              any changes.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy, please use our contact page or
              create an issue on our GitHub repository.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
