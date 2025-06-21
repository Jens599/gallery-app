"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InteractiveDemo() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  return (
    <div className="relative">
      <Card
        ref={cardRef}
        className="bg-card relative overflow-hidden p-0 shadow-2xl backdrop-blur-sm"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative h-96 w-full">
          {/* Original image with background */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{
              opacity: isHovering ? 0.05 : 1,
            }}
          >
            <img
              src="/pretty-woman-nice-forest.jpg"
              alt="Person with background"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>

          {/* Processed image (transparent background) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              clipPath: isHovering
                ? `circle(120px at ${mousePosition.x}% ${mousePosition.y}%)`
                : "circle(0px at 50% 50%)",
              transition: "clip-path 0.3s ease-out",
            }}
          >
            <img
              src="/pretty-woman-nice-forest-nobg.png"
              alt="Person without background"
              className="h-full w-full object-contain"
            />
            {/* Checkered background to show transparency */}
            <div
              className="absolute inset-0 -z-10 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), 
                  linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), 
                  linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
                `,
                backgroundSize: "20px 20px",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
              }}
            />
          </div>

          {/* Hover instruction */}
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="bg-card/80 text-card-foreground border-border"
            >
              {isHovering ? "Background Removed! ✨" : "Hover to see magic ✨"}
            </Badge>
          </div>

          {/* Mouse follower circle */}
          {isHovering && (
            <div
              className="border-primary pointer-events-none absolute rounded-full border-2 shadow-lg"
              style={{
                width: "240px",
                height: "240px",
                left: `${mousePosition.x}%`,
                top: `${mousePosition.y}%`,
                transform: "translate(-50%, -50%)",
                transition: "all 0.1s ease-out",
              }}
            />
          )}
        </div>
      </Card>

      {/* Floating elements */}
      <div className="absolute -top-4 -right-4 h-8 w-8 animate-bounce rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
      <div className="absolute -bottom-4 -left-4 h-6 w-6 animate-pulse rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
    </div>
  );
}
