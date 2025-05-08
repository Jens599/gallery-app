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
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={"/"}>
          <div className="flex items-center gap-2">
            {mounted && (
              <img
                src={theme === "dark" ? "/icon-white.svg" : "/icon-black.svg"}
                alt="Gallery App Logo"
                className="h-8 w-8"
                width={32}
                height={32}
              />
            )}
            <span className="text-xl font-semibold">Gallery App</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          {user.username ? (
            <>
              <div className="flex items-center gap-2" role="status">
                <span>Hi, {user.username}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Button size={"sm"} className="text black font-bold uppercase">
                  Signup
                </Button>
              </Link>
            </>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
