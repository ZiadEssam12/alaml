// GET /variants
// Purpose: List all variants for the product.
// Behavior: Returns variants including their selected option/value pairs (join rows) to make combinations explicit.
// Filtering: Support ?active=true/false, ?inStock=true/false and pagination when counts are large.
// 200 { variants: Variant[] }

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get pagination params from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10); // Default 50 (high enough for most cases)

    // Validate pagination params
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "معاملات الصفحة غير صحيحة" },
        { status: 400 }
      );
    }
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // checking for product existence
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const variants = await prisma.variant.findMany({
      where: { productID: id },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        variantOptions: {
          include: {
            option: true,
            value: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        variants,
        pagination: {
          page,
          pageSize,
          total: variants.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product variants:", error);
    return NextResponse.json(
      { error: "فشل في جلب متغيرات المنتج" },
      { status: 500 }
    );
  }
}
