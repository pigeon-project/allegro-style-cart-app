import { useState, useRef, useEffect } from "react";
import { useSpring, animated } from "react-spring";
import { useAddCartItem } from "../lib/cart-api";
import { mockProducts, type MockProduct } from "../data/mockProducts";

export default function RecommendedProducts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successProductTitle, setSuccessProductTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const addCartItemMutation = useAddCartItem();

  // Calculate how many items to show based on viewport
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerView(3); // Desktop: 3 items
      } else if (width >= 640) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(1); // Mobile: 1 item
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, mockProducts.length - itemsPerView);

  // Animation for carousel movement
  const springProps = useSpring({
    transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
    config: { tension: 280, friction: 60 },
  });

  // Animation for success toast
  const toastSpring = useSpring({
    opacity: showSuccessToast ? 1 : 0,
    transform: showSuccessToast ? "translateY(0)" : "translateY(-20px)",
    config: { tension: 300, friction: 20 },
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleAddToCart = (product: MockProduct) => {
    addCartItemMutation.mutate(
      {
        sellerId: product.sellerId,
        productImage: product.productImage,
        productTitle: product.productTitle,
        pricePerUnit: product.pricePerUnit,
        quantity: 1,
      },
      {
        onSuccess: () => {
          setSuccessProductTitle(product.productTitle);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
        },
      },
    );
  };

  // Touch/Mouse handlers for swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = startX - currentX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("keydown", handleKeyDown);
      return () => carousel.removeEventListener("keydown", handleKeyDown);
    }
  }, [maxIndex]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 transition-colors">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Recommended Products
      </h2>

      <div className="relative">
        {/* Previous Button - Desktop */}
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          aria-label="Previous products"
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5 text-slate-700 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="overflow-hidden touch-pan-y"
          tabIndex={0}
          role="region"
          aria-label="Recommended products carousel"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <animated.div
            className="flex gap-4"
            style={{
              ...springProps,
              width: `${(mockProducts.length / itemsPerView) * 100}%`,
            }}
          >
            {mockProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isLoading={addCartItemMutation.isPending}
                itemsPerView={itemsPerView}
              />
            ))}
          </animated.div>
        </div>

        {/* Next Button - Desktop */}
        <button
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Next products"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5 text-slate-700 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-indigo-600 dark:bg-indigo-400 w-6"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        ))}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <animated.div
          style={toastSpring}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-medium">
            "{successProductTitle}" added to cart!
          </span>
        </animated.div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: MockProduct;
  onAddToCart: (product: MockProduct) => void;
  isLoading: boolean;
  itemsPerView: number;
}

function ProductCard({
  product,
  onAddToCart,
  isLoading,
  itemsPerView,
}: ProductCardProps) {
  const cardWidth = `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * 16) / itemsPerView}px)`;

  return (
    <div
      className="flex-shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors"
      style={{ width: cardWidth }}
    >
      {/* Product Image */}
      <div className="aspect-square mb-3 overflow-hidden rounded-md">
        <img
          src={product.productImage}
          alt={product.productTitle}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Product Title */}
      <h3
        className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 min-h-[2.5rem]"
        title={product.productTitle}
      >
        {product.productTitle}
      </h3>

      {/* Price */}
      <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
        {product.pricePerUnit.toFixed(2)} PLN
      </p>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(product)}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] flex items-center justify-center gap-2"
        aria-label={`Add ${product.productTitle} to cart`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span>Add to Cart</span>
      </button>
    </div>
  );
}
