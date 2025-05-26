"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="Terms of Service"
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
          Please read these terms carefully before using CrazyPaste
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
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using CrazyPaste, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>2. Use License</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                Permission is granted to temporarily use CrazyPaste for personal, non-commercial
                transitory viewing only.
              </p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>3. Content Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>You are responsible for the content you paste. Do not upload:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Illegal, harmful, or offensive content</li>
                <li>Copyrighted material without permission</li>
                <li>Personal information of others</li>
                <li>Malicious code or scripts</li>
                <li>Spam or promotional content</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>4. Privacy and Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CrazyPaste uses local storage to save your pastes. We do not collect personal information
              or track users. Password-protected pastes are encrypted client-side for your security.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>5. Limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CrazyPaste and its suppliers will not be liable for any damages arising from the use or
              inability to use the service, even if we have been notified of the possibility of such damage.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>6. Revisions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              CrazyPaste may revise these terms at any time without notice. By using this service,
              you agree to be bound by the current version of these terms.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
