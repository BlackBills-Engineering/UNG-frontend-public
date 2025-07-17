import React, { useRef, useCallback, useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/Product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "../hooks/useCart";

interface ScrollableCarouselProps {
  items: Product[];
}

const ScrollableCarousel: React.FC<ScrollableCarouselProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addProduct } = useCart();
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollStatus = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const atStart = container.scrollLeft <= 0;
    const atEnd = container.scrollLeft >= maxScrollLeft - 1;
    setCanScrollPrev(!atStart);
    setCanScrollNext(!atEnd);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    updateScrollStatus();
    container.addEventListener("scroll", updateScrollStatus);
    window.addEventListener("resize", updateScrollStatus);
    return () => {
      container.removeEventListener("scroll", updateScrollStatus);
      window.removeEventListener("resize", updateScrollStatus);
    };
  }, [updateScrollStatus, items]);

  const scrollPrev = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const flex = container.firstElementChild as HTMLElement | null;
    if (!flex) return;
    const item = flex.firstElementChild as HTMLElement | null;
    const width = item?.offsetWidth || container.clientWidth;
    container.scrollBy({ left: -width, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const flex = container.firstElementChild as HTMLElement | null;
    if (!flex) return;
    const item = flex.firstElementChild as HTMLElement | null;
    const width = item?.offsetWidth || container.clientWidth;
    container.scrollBy({ left: width, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      <button
        onClick={scrollPrev}
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/10 backdrop-blur-sm text-white rounded-full
          border border-transparent hover:border-gray-200 transition-all duration-300 ease-in-out
          ${
            canScrollPrev
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none"
          }
        `}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={scrollRef}
        className="
          overflow-x-auto
          snap-x snap-mandatory
          scrollbar-none
          
        "
      >
        <div className="flex space-x-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="
                flex-shrink-0
                w-64 sm:w-72 md:w-80
                snap-start
              "
            >
              <ProductCard
                key={p.id}
                product={p}
                onSelect={() =>
                  addProduct({
                    id: p.id,
                    name: p.nameKey,
                    unitPrice: p.price,
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollNext}
        className={`
          absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 bg-white/10 backdrop-blur-sm text-white rounded-full
          border border-transparent hover:border-gray-200 transition-all duration-300 ease-in-out
          ${
            canScrollNext
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none"
          }
        `}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ScrollableCarousel;
