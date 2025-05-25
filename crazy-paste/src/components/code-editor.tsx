"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { createHighlighter } from "shiki";
import { FiCopy, FiDownload, FiShare } from "react-icons/fi";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { GlitchText } from "./ui/glitch-text";
import { motion } from "framer-motion";

interface CodeEditorProps {
  code: string;
  language: string;
  title?: string;
  readOnly?: boolean;
  onCodeChange?: (code: string) => void;
  showLineNumbers?: boolean;
  showHeader?: boolean;
  height?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  title = "Untitled",
  readOnly = false,
  onCodeChange,
  showLineNumbers = true,
  showHeader = true,
  height = "auto",
  className = "",
}) => {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const highlighter = await createHighlighter({
          themes: ["one-dark-pro"],
          langs: [language],
        });

        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: "one-dark-pro",
        });

        setHighlightedCode(html);
      } catch (error) {
        console.error("Error highlighting code:", error);
        // Fallback to plain text
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
      }
    };

    highlightCode();
  }, [code, language]);

  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast.success("Code copied to clipboard!", {
      style: {
        border: "1px solid hsl(var(--primary))",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      },
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileType = language === "text" ? "txt" : language;
    const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}.${fileType}`;
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("File downloaded!", {
      style: {
        border: "1px solid hsl(var(--primary))",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      },
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this code: ${title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("URL copied to clipboard!", {
          style: {
            border: "1px solid hsl(var(--primary))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
          },
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share", {
        style: {
          border: "1px solid hsl(var(--destructive))",
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        },
      });
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCodeChange) {
      onCodeChange(e.target.value);
    }
  };

  return (
    <div className={`w-full overflow-hidden rounded-md border border-border/50 bg-muted/30 backdrop-blur-sm ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500 opacity-80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500 opacity-80" />
              <div className="h-3 w-3 rounded-full bg-green-500 opacity-80" />
            </div>
            <GlitchText text={title} color="secondary" intensity="low" className="ml-2 text-sm font-medium" />
          </div>
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleCopyCode}
                >
                  <FiCopy className="h-4 w-4" />
                  <span className="sr-only">Copy code</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {isCopied ? "Copied!" : "Copy code"}
                </motion.p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleDownload}
                >
                  <FiDownload className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download file</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleShare}
                >
                  <FiShare className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      <div
        className={`relative ${showLineNumbers ? "line-numbers" : ""}`}
        style={{ maxHeight: height !== "auto" ? height : "none", overflowY: height !== "auto" ? "auto" : "visible" }}
      >
        {!readOnly && (
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleTextareaChange}
            className="absolute inset-0 resize-none border-0 bg-transparent p-4 font-mono text-transparent caret-white outline-none"
            style={{
              color: "transparent",
              caretColor: "hsl(var(--primary))",
              WebkitTextFillColor: "transparent",
              padding: showLineNumbers ? "1rem 1rem 1rem 3.5rem" : "1rem",
              height: "100%",
              width: "100%",
              zIndex: 1
            }}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        )}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: This content is safely generated by Shiki syntax highlighter */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        <pre
          ref={preRef}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className="max-w-full overflow-x-auto whitespace-pre p-4"
          style={{
            padding: showLineNumbers ? "1rem 1rem 1rem 3.5rem" : "1rem",
            margin: 0,
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
};
