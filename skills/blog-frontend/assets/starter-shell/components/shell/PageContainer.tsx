import type { ReactNode } from "react";

export function PageContainer({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="page-container">{children}</div>;
}
