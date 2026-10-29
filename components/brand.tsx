import { ScanSearch } from "lucide-react";

export function Brand({ small = false }: { small?: boolean }) {
  return <span className="brand"><span className="brand-mark"><ScanSearch size={small ? 17 : 19} /></span><span>CareerLens<span style={{ color: "var(--blue)" }}> AI</span></span></span>;
}
