"use client";

import { ArrowDownRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import {
  CATEGORIES,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  type CategoryDefinition,
} from "@/config/categories";
import { CatalogNotice } from "@/components/catalog-notice";

type AccentStyle = CSSProperties & { "--accent": string; "--accent-soft": string };

function accentStyle(category: CategoryDefinition): AccentStyle {
  return { "--accent": category.accent, "--accent-soft": category.accentSoft };
}

export function HomeScreen() {
  return (
    <main className="page-shell home-page">
      <section className="home-hero">
        <p className="eyebrow">Kiosco + almacén · Quilmes</p>
        <h1>
          <span>CUALQUIER <b>COSA.</b></span>
          <span>A CUALQUIER <b>HORA.</b></span>
        </h1>
        <p>Elegí lo tuyo. Lo armamos acá y terminás el pedido directo por WhatsApp.</p>
        <ArrowDownRight className="home-hero__arrow" size={34} aria-hidden="true" />
      </section>

      <CatalogNotice productsOnly />

      <section aria-labelledby="categorias-principales">
        <div className="section-heading">
          <p id="categorias-principales">Lo que pinta hoy</p>
          <span>01 — 04</span>
        </div>

        <div className="primary-grid">
          {PRIMARY_CATEGORIES.map((slug) => {
            const category = CATEGORIES[slug];
            return (
              <Link
                key={slug}
                className="category-cover"
                href={`/categoria/${slug}`}
                style={accentStyle(category)}
              >
                <Image
                  src={category.image!}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 50vw, 320px"
                  priority={slug === "tragos" || slug === "alfajores"}
                />
                <span className="category-cover__shade" />
                <div className="category-cover__content">
                  <span>Ver todo</span>
                  <strong>{category.label}</strong>
                  <ArrowRight size={20} aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Link className="anything-banner" href="/pedido#pedido-libre">
        <div>
          <span>¿No aparece?</span>
          <strong>Te llevamos cualquier cosa.</strong>
          <p>Escribinos lo que necesitás.</p>
        </div>
        <ArrowRight size={27} aria-hidden="true" />
      </Link>

      <section className="secondary-section" aria-labelledby="mas-categorias">
        <div className="section-heading">
          <p id="mas-categorias">También hay</p>
          <span>05 — 10</span>
        </div>
        <div className="secondary-grid">
          {SECONDARY_CATEGORIES.map((slug, index) => {
            const category = CATEGORIES[slug];
            return (
              <Link
                key={slug}
                href={`/categoria/${slug}`}
                style={accentStyle(category)}
              >
                <span>{String(index + 5).padStart(2, "0")}</span>
                <strong>{category.shortLabel}</strong>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="home-footer">
        <strong>LA BOMBA 24</strong>
        <p>Quilmes · abierto todo el día</p>
      </footer>
    </main>
  );
}
