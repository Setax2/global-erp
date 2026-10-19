export default function LayoutAcceso({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-acento">Global ERP</p>
        </div>
        <div className="tarjeta p-6">{children}</div>
      </div>
    </main>
  );
}
