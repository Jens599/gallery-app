const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <section className="mt-20 flex size-full justify-center md:mt-40">
      {children}
    </section>
  );
};
export default layout;
