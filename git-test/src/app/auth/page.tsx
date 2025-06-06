"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiGithub,
  FiShield,
  FiZap,
  FiKey
} from "react-icons/fi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { GlitchText } from "@/components/ui/glitch-text";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Particle animation for the background
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={`auth-particle-${Math.random()}-${Date.now()}-${i}`}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        toast.success("Welcome back!");
        router.push("/profile");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!signupForm.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      setIsLoading(false);
      return;
    }

    // Validate username
    if (signupForm.username.length < 3) {
      toast.error("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(signupForm.username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(signupForm);
      if (success) {
        toast.success("Account created successfully! Welcome!");
        router.push("/profile");
      } else {
        toast.error("Registration failed. Username might already be taken.");
      }
    } catch (error) {
      toast.error("Registration failed");
    }

    setIsLoading(false);
  };

  const handleSocialLogin = (provider: string) => {
    toast.success(`Initiating ${provider} authentication...`);
    // In a real app, this would redirect to OAuth provider
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-primary">
              User Access
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Login or create an account to continue
          </motion.p>
        </div>

        <Card className="bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/50 border-b border-border/30">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <FiZap className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <FiShield className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Login</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <FiKey className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        className="bg-background/50 border-border/50 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) =>
                          setLoginForm(prev => ({ ...prev, rememberMe: checked as boolean }))
                        }
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>

                    <Link
                      href="/auth/forgot"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <CyberpunkButton
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    glitchOnHover
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </CyberpunkButton>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("GitHub")}
                    className="bg-background/30 border-border/50"
                  >
                    <FiGithub className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("Google")}
                    className="bg-background/30 border-border/50"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                </div>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="p-6 space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">Create Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Join our community today
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Username
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={signupForm.username}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="your_username"
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <FiMail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <FiKey className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Create a secure password"
                        className="bg-background/50 border-border/50 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your password"
                        className="bg-background/50 border-border/50 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={signupForm.acceptTerms}
                      onCheckedChange={(checked) =>
                        setSignupForm(prev => ({ ...prev, acceptTerms: checked as boolean }))
                      }
                      required
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I accept the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <CyberpunkButton
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    glitchOnHover
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </CyberpunkButton>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("GitHub")}
                    className="bg-background/30 border-border/50"
                  >
                    <FiGithub className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("Google")}
                    className="bg-background/30 border-border/50"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Secure and encrypted authentication
        </motion.p>
      </motion.div>
    </div>
  );
}