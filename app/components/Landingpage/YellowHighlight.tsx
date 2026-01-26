export function YellowHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-primary px-1 box-decoration-clone">
      {children}
    </span>
  );
}
