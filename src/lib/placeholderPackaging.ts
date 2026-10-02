import type { Product } from "@/config/products";

/**
 * Generates a CLEARLY-MARKED placeholder for a product bag front.
 * This is not a packaging design — it exists only until the client's real
 * bag artwork is dropped into /public/packaging and referenced from
 * config/products.ts (`packagingTexture`).
 */
const cache = new Map<string, HTMLCanvasElement>();

export function placeholderPackagingCanvas(product: Product): HTMLCanvasElement {
  const hit = cache.get(product.id);
  if (hit) return hit;
  const W = 512, H = 704;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // woven polypropylene sack base
  g.fillStyle = "#efeadf";
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 0.06;
  g.fillStyle = "#6b6252";
  for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  for (let x = 0; x < W; x += 4) g.fillRect(x, 0, 1, H);
  g.globalAlpha = 1;

  // product colour band
  g.fillStyle = product.accent;
  g.fillRect(0, 0, W, 150);
  g.fillRect(0, H - 70, W, 70);

  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.font = "600 30px Manrope, system-ui, sans-serif";
  g.fillText("R U P A   F E E D S", W / 2, 70);
  g.font = "400 18px Manrope, system-ui, sans-serif";
  g.fillText("brand mark placeholder", W / 2, 104);

  g.fillStyle = "#1a2420";
  g.font = "600 52px Fraunces, Georgia, serif";
  const [first, ...rest] = product.name.split(" ");
  g.fillText(first, W / 2, 290);
  g.font = "400 40px Fraunces, Georgia, serif";
  g.fillText(rest.join(" "), W / 2, 342);

  g.strokeStyle = "#1a2420";
  g.globalAlpha = 0.35;
  g.lineWidth = 1.5;
  g.strokeRect(70, 400, W - 140, 150);
  g.globalAlpha = 1;
  g.fillStyle = "#4a524c";
  g.font = "500 18px Manrope, system-ui, sans-serif";
  g.fillText("Real packaging artwork", W / 2, 462);
  g.fillText("goes here", W / 2, 490);

  g.fillStyle = "#ffffff";
  g.font = "600 16px Manrope, system-ui, sans-serif";
  g.fillText("PLACEHOLDER · REPLACE WITH CLIENT ARTWORK", W / 2, H - 28);

  cache.set(product.id, c);
  return c;
}
