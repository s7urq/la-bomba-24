"use client";

import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import {
  CATEGORIES,
  PRIMARY_CATEGORIES,
  SECONDARY_CATEGORIES,
  type CategoryDefinition,
} from "@/config/categories";
import { LOCAL } from "@/config/local";
import { CatalogNotice } from "@/components/catalog-notice";
import { DeliveryBadge } from "@/components/delivery-badge";
import { DeliveryMoto } from "@/components/delivery-moto";
import { cartQuantity, useCartStore } from "@/store/cart-store";

type AccentStyle = CSSProperties & { "--accent": string; "--accent-soft": string };

function accentStyle(category: CategoryDefinition): AccentStyle {
  return { "--accent": category.accent, "--accent-soft": category.accentSoft };
}

export function HomeScreen() {
  const items = useCartStore((state) => state.items);
  const hydrated = useCartStore((state) => state.hydrated);
  const quantity = hydrated ? cartQuantity(items) : 0;

  return (
    <>
      <main className={`page-shell home-page ${quantity > 0 ? "home-page--con-moto" : ""}`}>
        {/* La ventanilla real por la que atienden, a pantalla completa, y los
            carteles apoyados encima como los que están pegados en la pared de
            un kiosco. Lucas no está acá a propósito: el que se asoma por la
            ventanilla ya es una persona, y dos caras en la misma pantalla se
            pisan. Lucas aparece más abajo, cuando ésta ya salió de cuadro. */}
        <section className="portada">
          <div className="portada__fondo" aria-hidden="true">
            <Image
              src="/local/ventanilla.webp"
              alt=""
              fill
              priority
              sizes="(max-width: 720px) 100vw, 720px"
            />
          </div>
          <span className="portada__velo" aria-hidden="true" />

          <DeliveryBadge />

          <div className="portada__contenido">
            <h1>
              <Image
                src="/brand/logo-neon.webp"
                alt="La Bomba 24"
                width={760}
                height={179}
                priority
              />
            </h1>
            {/* La promesa entera, en amarillo, sobre la foto. Antes esto vivía
                en un cartel aparte más abajo: como banner llegaba tarde y
                repetía en otro color lo que la portada ya tenía que decir. */}
            <p className="portada__promesa">Te lo llevamos a tu casa</p>

            <p className="portada__donde">
              <MapPin size={15} aria-hidden="true" />
              {LOCAL.esquina} · {LOCAL.ciudad}
            </p>
          </div>
        </section>

        <nav className="rubros-grid" aria-label="Lo que más sale">
          {PRIMARY_CATEGORIES.map((slug) => {
            const category = CATEGORIES[slug];
            return (
              <Link
                key={slug}
                className="rubro-cover"
                href={`/categoria/${slug}`}
                transitionTypes={["nav-forward"]}
                style={accentStyle(category)}
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 50vw, 340px"
                  />
                )}
                <span className="rubro-cover__shade" aria-hidden="true" />
                <div className="rubro-cover__pie">
                  <span>{category.nota ?? "Ver todo"}</span>
                  <strong>{category.label}</strong>
                  <ArrowRight size={19} aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </nav>

        <CatalogNotice productsOnly />

        {/* Acá abajo van los rubros a los que se les da menos bola, y acá es
            donde aparece Lucas: parado al lado del título, presentándolos.
            Antes flotaba suelto entre dos cajas del final y no se entendía qué
            hacía ahí — una persona recortada necesita estar parada en algo. */}
        <section className="secondary-section" aria-labelledby="mas-categorias">
          <p className="eyebrow section-eyebrow" id="mas-categorias">
            También hay
          </p>

          {/* Lucas al costado y los rubros en una columna a su derecha, como
              filas de lista. Ocupando media pantalla y con las categorías
              debajo, se llevaba todo el aire para no decir nada. */}
          <div className="rubros-fila">
            <Image
              className="rubros-fila__lucas"
              src="/local/lucas.webp"
              alt="Lucas, el dueño de La Bomba"
              width={544}
              height={1040}
            />

            <div className="secondary-grid">
              {SECONDARY_CATEGORIES.map((slug) => {
                const category = CATEGORIES[slug];

                return (
                  <Link
                    key={slug}
                    className="rubro-tile"
                    href={`/categoria/${slug}`}
                    transitionTypes={["nav-forward"]}
                    style={accentStyle(category)}
                  >
                    {category.image && (
                      <span className="rubro-tile__foto" aria-hidden="true">
                        <Image src={category.image} alt="" fill sizes="72px" />
                      </span>
                    )}
                    <strong>{category.shortLabel}</strong>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* El pedido libre va acá, después de todo el catálogo: recién cuando
            alguien terminó de mirar y no encontró lo suyo tiene sentido
            ofrecerle que lo escriba. */}
        <Link className="pedilo-igual" href="/pedido#pedido-libre" transitionTypes={["nav-forward"]}>
          <div>
            <strong>¿No está en la lista?</strong>
            <p>Escribinos, que capaz lo tenemos.</p>
          </div>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>

        {/* La dirección es lo último que se lee y tiene que quedar clavada: es
            el dato que busca el que quiere pasar a buscarlo. */}
        <footer className="home-footer">
          <strong>LA BOMBA 24</strong>
          <p className="home-footer__direccion">
            <MapPin size={16} aria-hidden="true" />
            {LOCAL.esquina}, {LOCAL.ciudad}
          </p>
          <p>Jueves a domingo, de 20 a 3 · Cuando ya cerró todo, seguimos nosotros.</p>
        </footer>
      </main>

      {/* En la home la moto solo aparece si hay algo cargado: con el carrito
          vacío taparía la foto para no decir nada. */}
      {quantity > 0 && <DeliveryMoto />}
    </>
  );
}
