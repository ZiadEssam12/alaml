export default function ProductPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <div className="w-16 h-4 bg-muted rounded animate-pulse" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-20 h-4 bg-muted rounded animate-pulse" />
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Product Images Skeleton */}
          <div className="space-y-4 lg:col-span-2">
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-6 border">
              <div className="w-full h-[500px] bg-muted rounded-xl animate-pulse" />
            </div>
            {/* Thumbnail skeletons */}
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Product Information Skeleton */}
          <div className="space-y-6 lg:col-span-3">
            {/* Product Details Skeleton */}
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg p-8 border space-y-6">
              {/* Category and Title */}
              <div className="space-y-4">
                <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                <div className="w-3/4 h-8 bg-muted rounded animate-pulse" />
              </div>

              {/* Price */}
              <div className="w-32 h-8 bg-muted rounded animate-pulse" />

              {/* Stock Status */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <div className="w-24 h-5 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="w-full h-4 bg-muted rounded animate-pulse" />
                  <div className="w-5/6 h-4 bg-muted rounded animate-pulse" />
                  <div className="w-4/6 h-4 bg-muted rounded animate-pulse" />
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="pt-6 border-t space-y-4">
                <div className="w-24 h-4 bg-muted rounded animate-pulse" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-input rounded-lg bg-background">
                    <div className="w-10 h-10 bg-muted rounded-l animate-pulse" />
                    <div className="w-16 h-10 bg-muted animate-pulse" />
                    <div className="w-10 h-10 bg-muted rounded-r animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-12 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Trust Badges Skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-card rounded-xl p-4 border text-center"
                >
                  <div className="w-8 h-8 bg-muted rounded mx-auto mb-2 animate-pulse" />
                  <div className="w-16 h-4 bg-muted rounded mx-auto animate-pulse" />
                  <div className="w-20 h-3 bg-muted rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Reviews section skeleton */}
        <section className="border-t pt-12 mb-12">
          <div className="mb-8 h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-card rounded-xl p-6 border shadow flex flex-col gap-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="w-32 h-4 bg-muted rounded" />
                  <div className="w-20 h-4 bg-muted rounded" />
                </div>
                <div className="w-full h-4 bg-muted rounded" />
                <div className="w-5/6 h-4 bg-muted rounded" />
                <div className="w-4/6 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
      {/* Similar products section skeleton */}
      <div className="mt-12">
        <div className="mb-4 h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-card rounded-2xl shadow-lg p-4 border flex flex-col items-center"
            >
              <div className="w-32 h-32 bg-muted rounded-xl animate-pulse mb-3" />
              <div className="w-24 h-5 bg-muted rounded animate-pulse mb-2" />
              <div className="w-16 h-4 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
