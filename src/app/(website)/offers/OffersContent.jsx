import Link from "next/link";
import { PaginationClient } from "@/components/Pagination";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

export default function OffersContent({ initialData, currentPage, error }) {
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
      return `${offer.value} ر.س`;
    } else if (offer.type === "free_shipping") {
      return "شحن مجاني";
    }
    return offer.title;
  };

  const { categoriesWithOffers = [], pagination = {} } = initialData || {};

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
    <div className="min-h-screen relative w-screen my-0! -mt-10!  right-1/2 translate-x-1/2 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <span className="text-blue-200 font-semibold">العروض الحصرية</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">احصل على أفضل الخصومات</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            اكتشف عروضنا المميزة والخصومات الحصرية على جميع الفئات
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categoriesWithOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithOffers.map((category) => (
              <Link key={category.id} href={`/offers/${category.id}`}>
                <div className="group h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 transform">
                  {/* Category Header */}
                  <div
                    className="p-8 text-white text-center relative overflow-hidden"
                    style={{ backgroundColor: category.color || "#3B82F6" }}
                  >
                    <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
                    </div>

                    <div className="relative">
                      <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                      <h2 className="text-2xl font-bold">{category.name}</h2>
                      <p className="text-sm text-white/80 mt-1">
                        {category._count.offers} عرض نشط
                      </p>
                    </div>
                  </div>

                  {/* Offers List */}
                  <div className="p-6">
                    {category.offers && category.offers.length > 0 ? (
                      <div className="space-y-4">
                        {category.offers.slice(0, 3).map((offer) => (
                          <div
                            key={offer.id}
                            className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            {/* Discount Badge */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                                  {offer.title}
                                </h3>
                                {offer.description && (
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {offer.description}
                                  </p>
                                )}
                              </div>
                              <div className="bg-red-500 text-white rounded-lg px-3 py-2 font-bold text-sm whitespace-nowrap mr-2 shadow-md">
                                {getDiscountBadge(offer)}
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  حتى {formatDate(offer.expirationDate)}
                                </span>
                              </div>
                              {offer.isAutoApply && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                  تطبيق تلقائي
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {category.offers.length > 3 && (
                          <div className="text-center pt-2">
                            <span className="text-xs text-blue-600 font-semibold">
                              +{category.offers.length - 3} عروض أخرى
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center text-sm">
                        لا توجد عروض متاحة
                      </p>
                    )}

                    {/* View All Button */}
                    <Link href={`/offers/${category.id}`}>
                      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 group/btn">
                        <span>عرض جميع العروض</span>
                        <TrendingUp className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              لا توجد عروض متاحة حالياً
            </h2>
            <p className="text-gray-600">
              يرجى العودة لاحقاً للاطلاع على العروض الجديدة
            </p>

            <div className="flex items-center justify-center gap-4 mt-8">
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

      {/* Pagination */}
      {categoriesWithOffers.length > 0 && pagination?.maxPage > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PaginationClient
            pagination={pagination}
            currentPage={currentPage}
            basePath="/offers"
            maxPage={pagination.maxPage}
          />
        </div>
      )}

      {/* Stats Section */}
      {categoriesWithOffers.length > 0 && (
        <div className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      )}
    </div>
  );
}
