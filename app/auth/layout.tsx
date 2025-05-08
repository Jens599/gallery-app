"use client";

import { Toaster } from "@/components/ui/sonner";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <section className="mt-20 flex size-full justify-center md:mt-40">
        {children}
      </section>
      <Toaster richColors />
    </>
  );
};

export default Layout;
