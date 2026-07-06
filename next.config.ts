import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Há outro projeto Next.js (com seu próprio package-lock.json) em uma pasta
  // ancestral. Sem isso, o Turbopack infere a raiz errada e passa a servir
  // public/ (logo, imagens de fundo etc.) da pasta ancestral em vez desta.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
