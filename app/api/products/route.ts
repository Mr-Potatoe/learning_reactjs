import { NextResponse } from "next/server";

// Define Product Type
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// API Route
export async function GET() {
  const products: Product[] = [
    {
      id: 1,
      name: "Product 1",
      price: 9.99,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 2,
      name: "Product 2",
      price: 9.99,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 3,
      name: "Product 3",
      price: 9.99,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ];

  return NextResponse.json({ products });
}
