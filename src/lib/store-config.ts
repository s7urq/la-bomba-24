import type { StoreConfig } from "@/types/domain";

export function withWhatsAppFallback(config: StoreConfig, fallback: string): StoreConfig {
  if (config.whatsapp) return config;

  return {
    ...config,
    whatsapp: fallback.replace(/\D/g, ""),
  };
}
