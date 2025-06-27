
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiMail, FiMessageSquare, FiHeart, FiSend, FiUser, FiPhone } from "react-icons/fi";
import { GlitchText } from "@/components/ui/glitch-text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Store contact message in localStorage for admin review
      const contactMessages = JSON.parse(localStorage.getItem('crazy-paste-contact-messages') || '[]');
      const newMessage = {
        id: crypto.randomUUID(),
        ...formData,
        userId: user?.id || null,
        timestamp: new Date().toISOString(),
        status: 'new',
        replied: false
      };

      contactMessages.push(newMessage);
      localStorage.setItem('crazy-paste-contact-messages', JSON.stringify(contactMessages));

      // If user is authenticated, also save to their contact history
      if (user) {
        const userContactKey = `user-contact-${user.id}`;
        const userContact = JSON.parse(localStorage.getItem(userContactKey) || '{}');
        userContact.contactHistory = [
          ...(userContact.contactHistory || []),
          {
            action: 'contact_form_submitted',
            timestamp: new Date().toISOString(),
            subject: formData.subject,
            category: formData.category
          }
        ].slice(-20); // Keep last 20 contact events
        localStorage.setItem(userContactKey, JSON.stringify(userContact));
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: user?.displayName || "",
        email: user?.email || "",
        subject: "",
        category: "",
        message: ""
      });

    } catch (error) {
      console.error('Error sending contact message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center">
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
          We'd love to hear from you - send us a message and we'll respond as soon as possible
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-background/50 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMail className="h-5 w-5 text-primary" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="security">Security Issue</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more details..."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    required
                  />
                </div>

                <CyberpunkButton
                  type="submit"
                  disabled={isSubmitting}
                  glitchOnHover
                  className="w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSend className="h-4 w-4" />
                      Send Message
                    </span>
                  )}
                </CyberpunkButton>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info & Links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* GitHub */}
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
                onClick={() => window.open("https://github.com/yourusername/crazypaste", "_blank")}
              >
                <FiGithub className="mr-2 h-4 w-4" />
                View Repository
              </CyberpunkButton>
            </CardContent>
          </Card>

          {/* Discussions */}
          <Card className="backdrop-blur-sm bg-background/50 border-border/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiMessageSquare className="h-5 w-5 text-secondary" />
                Community
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
                onClick={() => window.open("https://github.com/yourusername/crazypaste/discussions", "_blank")}
              >
                <FiMessageSquare className="mr-2 h-4 w-4" />
                Join Discussions
              </CyberpunkButton>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="backdrop-blur-sm bg-background/50 border-border/30">
            <CardContent className="p-4">
              <div className="text-center">
                <FiMail className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h4 className="font-semibold mb-1">Response Time</h4>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="backdrop-blur-sm bg-background/50 border-border/30">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => window.open("https://github.com/yourusername/crazypaste/issues", "_blank")}
                className="text-center hover:bg-background/50 p-3 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1 text-primary">Bug Reports</h4>
                <p className="text-xs text-muted-foreground">GitHub Issues</p>
              </button>
              <button 
                onClick={() => window.open("https://github.com/yourusername/crazypaste/discussions", "_blank")}
                className="text-center hover:bg-background/50 p-3 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1 text-primary">Feature Requests</h4>
                <p className="text-xs text-muted-foreground">GitHub Discussions</p>
              </button>
              <button 
                onClick={() => window.open("https://github.com/yourusername/crazypaste/wiki", "_blank")}
                className="text-center hover:bg-background/50 p-3 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1 text-primary">Documentation</h4>
                <p className="text-xs text-muted-foreground">GitHub Wiki</p>
              </button>
              <button 
                onClick={() => window.open("https://github.com/yourusername/crazypaste/releases", "_blank")}
                className="text-center hover:bg-background/50 p-3 rounded-lg transition-colors"
              >
                <h4 className="font-semibold text-sm mb-1 text-primary">Changelog</h4>
                <p className="text-xs text-muted-foreground">GitHub Releases</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Support Project */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
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
