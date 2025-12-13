import Link from "next/link";
import { PaginationClient } from "@/components/Pagination";
import { Sparkles, TrendingUp, Clock, ChevronRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function OffersContent({
  initialData,
  currentPage,
  error,
  productsWithOffers = [],
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
    });
  };

  const getDiscountBadge = (offer) => {
    if (offer.type === "percentage") {
      return `${offer.value}%`;
    } else if (offer.type === "fixed") {
      return `${offer.value} ج.م  `;
    } else if (offer.type === "free_shipping") {
      return "شحن مجاني";
    }
    return offer.title;
  };

  const calculateDiscountedPrice = (originalPrice, offers) => {
    if (!offers || offers.length === 0) return null;
    const offer = offers[0];
    const price = parseFloat(originalPrice);
    const value = parseFloat(offer.value);

    if (offer.type === "percentage") {
      const discount = price * (value / 100);
      const maxDiscount = offer.maxDiscountAmount
        ? parseFloat(offer.maxDiscountAmount)
        : null;
      const actualDiscount = maxDiscount
        ? Math.min(discount, maxDiscount)
        : discount;
      return Math.max(0, price - actualDiscount);
    } else if (offer.type === "fixed") {
      return Math.max(0, price - value);
    }
    return null;
  };

  let {
    categoriesWithOffers = [],
    productsWithOffers: initialProducts = [],
    pagination = {},
  } = initialData || {};

  // Use fallback prop if no products in initialData
  const productsToDisplay =
    initialProducts.length > 0 ? initialProducts : productsWithOffers;

  // Show error state if there's an error and no data
  if (error && categoriesWithOffers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            لا توجد عروض متاحة
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">تسوق العروض حسب الفئات</h1>
          <p className="text-slate-300">احصل على أفضل العروض والخصومات</p>
        </div>
      </div>

      {/* Categories Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categoriesWithOffers.length > 0 ? (
          <>
            {/* Category Cards Carousel */}
            <div className="mb-12">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                التسوق حسب الفئة
              </h3>
              <Carousel>
                <CarouselContent className="items-stretch">
                  {categoriesWithOffers.map((category) => (
                    <CarouselItem
                      key={category.id}
                      className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                    >
                      <Link href={`/offers/${category.id}`}>
                        <div className="flex flex-col items-center gap-3 cursor-pointer group h-full">
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg group-hover:shadow-xl "
                            style={{
                              backgroundColor: category.color || "#3B82F6",
                            }}
                          >
                            {category.icon}
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 max-w-[90px]">
                              {category.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {category._count.offers} عرض
                            </p>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext />
                <CarouselPrevious />
              </Carousel>
            </div>

            {/* "View All Offers" Banner */}
            <div className="mb-12">
              <Link href="/offers/all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 shadow-lg hover:shadow-xl  cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <h2 className="text-2xl font-bold mb-2">
                        جميع العروض والخصومات
                      </h2>
                      <p className="text-blue-100">
                        اكتشف أكثر من{" "}
                        {categoriesWithOffers.reduce(
                          (sum, cat) => sum + (cat._count.offers || 0),
                          0
                        )}{" "}
                        عرض حصري
                      </p>
                    </div>
                    <ChevronRight className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Featured Offers Section - Recent Products with Offers */}
            {productsToDisplay.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  أحدث المنتجات بعروض خاصة
                </h2>
                <Carousel autoPlay autoPlayDelay={"10000"}>
                  <CarouselContent className="items-stretch">
                    {productsToDisplay.map((product) => (
                      <CarouselItem
                        key={product.id}
                        className="md:basis-1/2 lg:basis-1/4"
                      >
                        <Link href={`/products/${product.id}`}>
                          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                            {/* Product Image */}
                            <div className="h-40 bg-gray-100 overflow-hidden flex items-center justify-center relative">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-400 text-4xl">📦</div>
                              )}
                              {/* Discount Badge */}
                              {(product.offers?.length > 0 ||
                                product.variants?.some(
                                  (v) => v.offers?.length > 0
                                )) && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                  {product.offers && product.offers.length > 0
                                    ? product.offers[0].type === "percentage"
                                      ? `${product.offers[0].value}%`
                                      : product.offers[0].type === "fixed"
                                      ? `${product.offers[0].value} ج.م`
                                      : "عرض خاص"
                                    : product.variants?.[0]?.offers?.[0]
                                    ? product.variants[0].offers[0].type ===
                                      "percentage"
                                      ? `${product.variants[0].offers[0].value}%`
                                      : "عرض خاص"
                                    : "عرض خاص"}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                              <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                                {product.name}
                              </h3>

                              {/* Rating and Reviews */}
                              <div className="flex items-center gap-1 mb-3">
                                {product.rating ? (
                                  <>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < Math.round(product.rating)
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      ({product._count?.reviews || 0})
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    لا توجد تقييمات
                                  </span>
                                )}
                              </div>

                              {/* Price */}
                              <div className="mb-3">
                                {(() => {
                                  const productOffer = product.offers?.[0];
                                  const variantOffer =
                                    product.variants?.[0]?.offers?.[0];
                                  const activeOffer =
                                    productOffer || variantOffer;

                                  // Use variant price if the offer is on a variant
                                  const basePrice =
                                    (productOffer
                                      ? product.price
                                      : product.variants?.[0]?.price) ||
                                    product.price;

                                  const discountedPrice = activeOffer
                                    ? calculateDiscountedPrice(basePrice, [
                                        activeOffer,
                                      ])
                                    : null;

                                  if (
                                    discountedPrice !== null &&
                                    discountedPrice < basePrice
                                  ) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-red-600">
                                          {discountedPrice.toFixed(2)} ر.س
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                          {basePrice} ر.س
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <p className="text-lg font-bold text-gray-800">
                                      {product.price} ر.س
                                    </p>
                                  );
                                })()}
                              </div>

                              {/* Top Offers */}
                              {(product.offers?.length > 0 ||
                                product.variants?.some(
                                  (v) => v.offers?.length > 0
                                )) && (
                                <div className="bg-blue-50 p-2 rounded-lg mb-3">
                                  <p className="text-xs font-semibold text-blue-700 mb-1">
                                    عروض متاحة:
                                  </p>
                                  <div className="space-y-1">
                                    {product.offers
                                      ?.slice(0, 1)
                                      .map((offer) => (
                                        <p
                                          key={offer.id}
                                          className="text-xs text-gray-700"
                                        >
                                          • {offer.title}
                                        </p>
                                      ))}
                                    {product.variants?.[0]?.offers
                                      ?.slice(0, 1)
                                      .map((offer) => (
                                        <p
                                          key={offer.id}
                                          className="text-xs text-gray-700"
                                        >
                                          • {offer.title}
                                        </p>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Add to Cart Button */}
                              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
                                إضافة للسلة
                              </button>
                            </div>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselNext />
                  <CarouselPrevious />
                </Carousel>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-16 bg-gray-50 rounded-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {categoriesWithOffers.length}
                  </div>
                  <p className="text-gray-600">فئات بعروض نشطة</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {categoriesWithOffers.reduce(
                      (sum, cat) => sum + (cat._count.offers || 0),
                      0
                    )}
                  </div>
                  <p className="text-gray-600">إجمالي العروض النشطة</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    100%
                  </div>
                  <p className="text-gray-600">تطبيق تلقائي للخصومات</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              لا توجد عروض متاحة حالياً
            </h2>
            <p className="text-gray-600 mb-8">
              يرجى العودة لاحقاً للاطلاع على العروض الجديدة
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                الصفحة الرئيسية
              </Link>

              <Link
                href="/products"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                جميع المنتجات
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
