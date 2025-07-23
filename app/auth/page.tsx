"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/components/Login";
import Signup from "@/components/Signup";
import PublicRoute from "@/components/PublicRoute";
import Image from "next/image";

function AuthPage() {
  return (
    <PublicRoute>
      <>
        <div className="mb-6 text-center">
          <img
            src="/auth_image.png"
            alt="A shadowy, cat-like creature with glowing purple eyes and armor."
            style={{ maxWidth: '320px', width: '100%', height: 'auto', margin: '0 auto' }}
            className="rounded-lg mb-6 shadow-lg"
          />
          <h2 className="text-2xl font-bold mb-2">Welcome to voidbg</h2>
          <p className="text-muted-foreground text-base">
            Sign in or create an account to access your voidbg. Your
            credentials are safe and never shared.
          </p>
        </div>
        <Tabs defaultValue="Login" className="mx-8 w-lg min-w-64">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Login">Login</TabsTrigger>
            <TabsTrigger value="Signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="Login">
            <Login />
          </TabsContent>
          <TabsContent value="Signup">
            <Signup />
          </TabsContent>
        </Tabs>
      </>
    </PublicRoute>
  );
}

export default AuthPage;
