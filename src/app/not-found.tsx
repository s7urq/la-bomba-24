import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell not-found-page">
      <span>404</span>
      <h1>ACÁ NO HAY NADA.</h1>
      <p>Volvé al catálogo y elegí lo que necesitás.</p>
      <Link className="primary-button" href="/" transitionTypes={["nav-back"]}>
        <ArrowLeft size={18} aria-hidden="true" />
        Volver al inicio
      </Link>
    </main>
  );
}
