"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiCode, FiDatabase, FiGlobe } from "react-icons/fi";

export default function APIPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlitchText
            text="API Documentation"
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
          Client-side API for managing pastes programmatically
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
            <CardTitle className="flex items-center gap-2">
              <FiDatabase className="h-5 w-5" />
              Overview
            </CardTitle>
            <CardDescription>
              CrazyPaste uses a client-side architecture with localStorage for data persistence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <p>
                All operations are performed locally in the browser. There is no server-side API,
                making CrazyPaste completely privacy-focused and offline-capable.
              </p>
              <div className="flex gap-2 mt-4">
                <Badge variant="outline">Client-Side Only</Badge>
                <Badge variant="outline">No Server</Badge>
                <Badge variant="outline">Privacy-First</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Core Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border border-border/30 rounded p-4">
                <h4 className="font-semibold text-primary mb-2">createPaste(input: CreatePasteInput)</h4>
                <p className="text-muted-foreground text-sm mb-2">
                  Creates a new paste with the specified content and options.
                </p>
                <pre className="bg-muted/50 p-2 rounded text-xs overflow-x-auto">
{`{
  title: string;
  content: string;
  language: string;
  expiration: ExpirationOption;
  password?: string;
  burnAfterReading: boolean;
}`}
                </pre>
              </div>

              <div className="border border-border/30 rounded p-4">
                <h4 className="font-semibold text-primary mb-2">getPasteById(id: string)</h4>
                <p className="text-muted-foreground text-sm">
                  Retrieves a paste by its unique ID. Returns null if not found or expired.
                </p>
              </div>

              <div className="border border-border/30 rounded p-4">
                <h4 className="font-semibold text-primary mb-2">getRecentPastes(limit?: number)</h4>
                <p className="text-muted-foreground text-sm">
                  Returns recent public pastes (excludes password-protected and burn-after-reading).
                </p>
              </div>

              <div className="border border-border/30 rounded p-4">
                <h4 className="font-semibold text-primary mb-2">deletePaste(id: string)</h4>
                <p className="text-muted-foreground text-sm">
                  Permanently deletes a paste from localStorage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Expiration Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><Badge variant="outline">never</Badge> - Never expires</div>
              <div><Badge variant="outline">10m</Badge> - 10 minutes</div>
              <div><Badge variant="outline">1h</Badge> - 1 hour</div>
              <div><Badge variant="outline">1d</Badge> - 1 day</div>
              <div><Badge variant="outline">1w</Badge> - 1 week</div>
              <div><Badge variant="outline">1m</Badge> - 1 month</div>
              <div><Badge variant="outline">burn</Badge> - Burn after reading</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiCode className="h-5 w-5" />
              Example Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto text-foreground">
{`import { createPaste, getPasteById } from '@/lib/paste-service';

// Create a new paste
const paste = createPaste({
  title: "My Code Snippet",
  content: "console.log('Hello, World!');",
  language: "javascript",
  expiration: "1d",
  burnAfterReading: false
});

// Retrieve a paste
const retrievedPaste = getPasteById(paste.id);

// Check if paste exists and is valid
if (retrievedPaste) {
  console.log(retrievedPaste.content);
}`}
            </pre>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiGlobe className="h-5 w-5" />
              URL Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><code className="bg-muted/50 px-2 py-1 rounded">/paste/[id]</code> - View a specific paste</div>
              <div><code className="bg-muted/50 px-2 py-1 rounded">/new</code> - Create a new paste</div>
              <div><code className="bg-muted/50 px-2 py-1 rounded">/new?fork=[id]</code> - Fork an existing paste</div>
              <div><code className="bg-muted/50 px-2 py-1 rounded">/recent</code> - Browse recent public pastes</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground space-y-2">
              <ul className="list-disc pl-6 space-y-1">
                <li>localStorage has a 5-10MB limit depending on the browser</li>
                <li>Data is not synchronized across devices or browsers</li>
                <li>Clearing browser data will delete all pastes</li>
                <li>No server-side backup or recovery options</li>
                <li>Paste URLs only work within the same browser/device</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
