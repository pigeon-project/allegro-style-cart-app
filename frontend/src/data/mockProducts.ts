/**
 * Mock product data for the recommended products carousel
 */

export interface MockProduct {
  id: string;
  sellerId: string;
  productImage: string;
  productTitle: string;
  pricePerUnit: number;
}

export const mockProducts: MockProduct[] = [
  {
    id: "prod-1",
    sellerId: "550e8400-e29b-41d4-a716-446655440001",
    productImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    productTitle: "Premium Wireless Headphones with Noise Cancellation",
    pricePerUnit: 299.99,
  },
  {
    id: "prod-2",
    sellerId: "550e8400-e29b-41d4-a716-446655440002",
    productImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    productTitle: "Smart Watch with Health Monitoring",
    pricePerUnit: 199.99,
  },
  {
    id: "prod-3",
    sellerId: "550e8400-e29b-41d4-a716-446655440003",
    productImage:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    productTitle: "Designer Sunglasses UV Protection",
    pricePerUnit: 149.99,
  },
  {
    id: "prod-4",
    sellerId: "550e8400-e29b-41d4-a716-446655440001",
    productImage:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
    productTitle: "Leather Backpack for Travel",
    pricePerUnit: 89.99,
  },
  {
    id: "prod-5",
    sellerId: "550e8400-e29b-41d4-a716-446655440004",
    productImage:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    productTitle: "Portable Bluetooth Speaker",
    pricePerUnit: 79.99,
  },
  {
    id: "prod-6",
    sellerId: "550e8400-e29b-41d4-a716-446655440002",
    productImage:
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    productTitle: "Fitness Tracker Smart Band",
    pricePerUnit: 59.99,
  },
];
