"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Palette,
  MousePointer,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { InteractiveDemo } from "@/components/interactive-demo";

const page = () => {
  const router = useRouter();
  const [posX, setPosX] = useState<number>(0);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/gallery");
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, [router]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setPosX((prevX) =>
      e.nativeEvent.offsetX !== prevX ? e.nativeEvent.offsetX : prevX,
    );
  }, []);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-Powered Web Gallery
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  Your gallery,
                  <span className="from-primary to-chart-1 bg-gradient-to-r bg-clip-text text-transparent">
                    {" "}
                    perfected
                  </span>
                </h1>
                <p className="text-muted-foreground max-w-lg text-xl">
                  Upload, organize, and transform your photos with AI-powered
                  background removal. Create stunning galleries that showcase
                  your work beautifully.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Link href={"/auth"} className="flex">
                    <Upload className="mr-2 h-4 w-4" />
                    Start Your Gallery
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  <span>Easy to use</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                  <span>Cloud storage</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span>Completely free</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl"></div>
              <InteractiveDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <Badge
              variant="secondary"
              className="border-slate-700 bg-slate-800 text-slate-300"
            >
              Features
            </Badge>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Everything you need for perfect galleries
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-slate-300">
              Powerful AI technology meets intuitive gallery management to
              showcase your photos beautifully.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>AI Background Removal</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Easily remove backgrounds from your photos with our powerful
                  AI engine
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Gallery Organization</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Automatically organize photos by subject, color, or custom
                  tags for easy browsing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Batch Processing</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Process entire photo collections at once and build galleries
                  in minutes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <MousePointer className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Smart Edge Detection</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Preserve fine details like hair, fur, and transparent objects
                  with precision
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Shareable Galleries</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create beautiful, responsive galleries that look perfect on
                  any device
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Cloud Storage</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Secure cloud storage with automatic backups and cross-device
                  sync
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="gallery"
        className="from-primary/20 to-chart-1/20 bg-gradient-to-r px-4 py-20"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Ready to create stunning galleries?
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-purple-100">
                Join thousands of photographers, designers, and content creators
                who use PhotoCut Gallery to showcase their work beautifully.
              </p>
            </div>

            <div className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 bg-white text-purple-600 hover:bg-gray-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-purple-300 text-purple-100 hover:bg-purple-800/50"
              >
                View Examples
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-purple-200">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                <span>No credit card needed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>100% free forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <span>Start in seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">PhotoCut Gallery</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The most intuitive web gallery with AI-powered background
                removal for creators and professionals.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="transition-colors hover:text-purple-400"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} PhotoCut Gallery. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default page;
