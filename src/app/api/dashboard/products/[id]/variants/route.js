// GET /variants
// Purpose: List all variants for the product.
// Behavior: Returns variants including their selected option/value pairs (join rows) to make combinations explicit.
// Filtering: Support ?active=true/false, ?inStock=true/false and pagination when counts are large.
// 200 { variants: Variant[] }

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }
    const variants = await prisma.variant.findMany({
      where: { productID: id },
      include: {
        variantOptions: {
          include: {
            option: true,
            value: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product variants:", error);
    return NextResponse.json(
      { error: "فشل في جلب متغيرات المنتج" },
      { status: 500 }
    );
  }
}
