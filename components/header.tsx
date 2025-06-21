"use client";

import { useTheme } from "next-themes";
import { ModeToggle } from "./theme-toggle";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email: string;
  token: string;
}

const Header = () => {
  const { resolvedTheme: theme = "system" } = useTheme();
  const [user, setUser] = useState<User>({
    username: "",
    email: "",
    token: "",
  });
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUser({
      username: "",
      email: "",
      token: "",
    });

    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token) {
      setUser({
        username: localStorage.getItem("username") || "",
        email: localStorage.getItem("email") || "",
        token,
      });
    }

    // Add event listener for auth state changes
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setUser({
          username: localStorage.getItem("username") || "",
          email: localStorage.getItem("email") || "",
          token,
        });
      } else {
        setUser({
          username: "",
          email: "",
          token: "",
        });
      }
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  return (
    <header className="bg-card/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-2">
          <Link href={"/"} className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              {mounted && theme === "dark" ? (
                <img
                  src="/icon-white.svg"
                  alt="Gallery App Logo"
                  className="h-5 w-5"
                  width={20}
                  height={20}
                />
              ) : (
                <img
                  src="/icon-black.svg"
                  alt="Gallery App Logo"
                  className="h-5 w-5"
                  width={20}
                  height={20}
                />
              )}
            </div>
            <span className="text-xl font-bold">PhotoCut Gallery</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <div className="hidden items-center space-x-6 md:flex">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="#gallery"
              className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
            >
              Gallery
            </Link>
            {user.username ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Hi, {user.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
