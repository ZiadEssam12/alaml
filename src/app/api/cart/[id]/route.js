// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // GET: Get a single cart by id
// export async function GET(request, { params }) {
//   try {
//     const { id } = await params;
//     if (!id) {
//       return NextResponse.json(
//         { error: "Cart id is required" },
//         { status: 400 }
//       );
//     }
//     const cart = await prisma.cart.findUnique({
//       where: { id },
//       include: { items: true },
//     });
//     if (!cart) {
//       return NextResponse.json({ error: "Cart not found" }, { status: 404 });
//     }
//     return NextResponse.json(
//       { data: cart, message: "Cart fetched successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch cart" },
//       { status: 500 }
//     );
//   }
// }
