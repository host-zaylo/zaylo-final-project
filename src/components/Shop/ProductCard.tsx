import React, { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "../Shop/CartContext";
import type { Product, ProductVariant } from "../../data/products";

const colorSwatchMap: Record<string, string> = {
  black: "#000000",
  rose: "#f08a9d",
  "black lemon": "#121212",
  candy: "#ff69b4",
  "space gray": "#6b7280",
  "space rose": "#d6a5c0",
  "zaylo white": "#004a6a",
  "black yellow": "#1f1f1f",
};

const getVariantStyle = (color?: string): React.CSSProperties => {
  if (!color) return { backgroundColor: "#ccc" };
  const normalized = color.trim().toLowerCase();
  if (normalized === "black lemon")
    return { background: "linear-gradient(to right, #000000 50%, #ffff00 50%)" };
  const mappedColor = colorSwatchMap[normalized];
  if (mappedColor) return { backgroundColor: mappedColor };
  if (/^[a-z]+$/.test(normalized)) return { backgroundColor: normalized };
  return { backgroundColor: "#ccc" };
};

const sizeChartData = [
  ["PP", "32-40cm (13-16in)", "20-28cm (8-11in)"],
  ["P", "38-46cm (15-18in)", "24-34cm (9-14in)"],
  ["M", "46-56cm (18-22in)", "28-40cm (11-16in)"],
  ["G", "56-68cm (22-27in)", "36-50cm (14-20in)"],
];

function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);
  const [showQuickShop, setShowQuickShop] = useState(false);
  const { addToCart } = useCart();

  const images = selectedVariant?.images || [];

  return (
    <>
      <div className="flex flex-col transition-all duration-300 sm:max-w-xs">
        <a href={`/produtos/${product.slug}`} className="block">
          <div className="flex-shrink-0 relative">
            <div
              className="shadow-xl rounded-t-xl w-full aspect-[3/4] bg-[#f5f5f5] flex justify-center items-center relative overflow-hidden"
              style={{ backgroundImage: "url('/background/background.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <img src={images[0] || "/path/to/fallback.jpg"} alt={product.title} className="w-full h-full object-cover z-10" loading="lazy" />
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickShop(true); }}
                className="absolute bottom-4 left-4 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-gray-50 transition-all z-30"
              >
                <ShoppingCart className="w-5 h-5 text-black" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </a>

        <div className="flex-1 flex flex-col justify-end items-start py-4 px-2 gap-1">
          <div className="flex flex-col items-start gap-1">
            <h2 className="font-body text-black text-md text-left">{product.title}</h2>
            <div className="flex gap-2">
              {product.variants?.map((variant: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-6 h-6 rounded-full border-2 border-gray-200 focus:outline-none ${selectedVariant?.color === variant.color ? "ring-2 ring-[#02BED0]" : ""}`}
                  style={getVariantStyle(variant.color)}
                  title={variant.color}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <p className="font-body tracking-tight uppercase text-black text-xs whitespace-nowrap mt-1">R$ {product.price.toFixed(2)}</p>
              <p className="font-heading font-medium tracking-tight text-black text-xs whitespace-nowrap mt-1">(até 3x s/ juros)</p>
            </div>
          </div>
        </div>
      </div>

      {showQuickShop && (
        <QuickShopModal
          product={product}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          onClose={() => setShowQuickShop(false)}
        />
      )}
    </>
  );
}

function QuickShopModal({ product, selectedVariant, setSelectedVariant, onClose }: any) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);

  const images = selectedVariant?.images || [];
  const needsSize = selectedVariant?.sizes?.length > 0;

  const handleAddToCart = () => {
    if (needsSize && !selectedSize) return;
    addToCart(product, selectedVariant, 1, selectedSize || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div onClick={onClose} className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col pt-8 overflow-hidden animate-slide-in">
        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
          <X className="w-6 h-6 text-black" strokeWidth={1.5} />
        </button>

        <div className="p-4 flex-shrink-0 space-y-1">
          <h2 className="text-xl font-light text-black tracking-tight leading-tight">{product.title}</h2>
          <p className="text-sm text-gray-600">Zaylo</p>
          <p className="text-md font-normal text-black">R$ {product.price.toFixed(2)}</p>
        </div>

        <div
          className="flex overflow-x-auto gap-2 flex-1 scroll-smooth hide-scrollbar"
          style={{ backgroundImage: 'url("/background/background.jpg")', backgroundSize: "cover", backgroundPosition: "center" }}
        >
          {images.map((img: string, i: number) => (
            <div key={i} className="flex-shrink-0 w-64 sm:w-80 aspect-[3/4] border border-white/20 shadow-md overflow-hidden">
              <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 p-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-heading font-medium text-black uppercase tracking-wider">Cor:</span>
                <span className="text-xs font-body font-light tracking-wide text-gray-600">{selectedVariant?.color}</span>
              </div>
              <div className="flex gap-3">
                {product.variants?.map((variant: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedVariant(variant); setSelectedSize(""); }}
                    className={`w-16 h-16 border-2 rounded-md overflow-hidden transition-all ${selectedVariant?.color === variant.color ? "border-black ring-2 ring-offset-2 ring-[#eae951]" : "border-gray-300 hover:border-gray-400"}`}
                    title={variant.color}
                  >
                    <img src={variant.images?.[0] || "/path/to/fallback.jpg"} alt={variant.color} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSizeChart(!showSizeChart)} className="flex items-center gap-2 text-xs font-body text-black underline underline-offset-2">
                <span>Tabela de Medidas</span>
              </button>
            </div>

            {needsSize && (
              <div className="flex flex-col justify-center items-center w-full gap-4">
                <label className="block text-xs font-heading font-medium text-black uppercase tracking-wider">Tamanho</label>
                <div className="flex flex-row justify-center items-center w-full gap-2">
                  {selectedVariant.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border text-sm font-body font-light transition-all ${selectedSize === size ? "bg-black text-white border-black" : "bg-white text-black border-gray-300 hover:border-black"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-1 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={needsSize && !selectedSize}
                className="flex-1 text-white py-4 px-6 text-sm font-body uppercase tracking-wider transition-colors disabled:bg-gray-300 cursor-not-allowed bg-[#131819] hover:bg-gray-900"
              >
                Adicionar ao Carrinho
              </button>
            </div>

            <div className="h-px bg-gray-200" />
            <a href={`/produtos/${product.slug}`} className="w-full text-center text-sm font-body font-light text-black uppercase tracking-wider hover:text-gray-600 transition-colors py-2 underline underline-offset-4">
              Mais Detalhes
            </a>
          </div>
        </div>
      </div>

      {showSizeChart && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4">
          <div onClick={() => setShowSizeChart(false)} className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-auto shadow-lg">
            <button onClick={() => setShowSizeChart(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
            <h3 className="text-xl font-body font-light uppercase tracking-wide text-center mb-4">Tabela de Medidas</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 font-heading font-medium">Tamanho</th>
                    <th className="border border-gray-300 px-4 py-2 font-heading font-medium">Peitoral</th>
                    <th className="border border-gray-300 px-4 py-2 font-heading font-medium">Nuca</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChartData.map(([size, peitoral, nuca]) => (
                    <tr key={size}>
                      <td className="border border-gray-300 px-4 py-2 text-center font-heading font-bold">{size}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-body text-xs">{peitoral}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-body text-xs">{nuca}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 justify-end items-center mt-4">
              <p className="text-xs text-gray-600 font-body font-light">Certifique-se de que o peitoral está devidamente ajustado para o tamanho do seu cachorro.</p>
              <img src="/logos/favicon-zaylo.png" className="max-w-8 invert" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
