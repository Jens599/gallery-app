"use client";

import { useTheme } from "next-themes";
import { ModeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {} from "lucide-react";

const Header = () => {
  const { resolvedTheme: theme = "system" } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-16">
        <div className="">
          <div className="flex items-center gap-2">
            {!mounted ? null : (
              <img
                src={theme === "dark" ? "/icon-white.svg" : "/icon-black.svg"}
                alt="Logo"
                className="h-8 w-8"
              />
            )}
            <span className="text-xl font-semibold">Gallery App</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"></div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
