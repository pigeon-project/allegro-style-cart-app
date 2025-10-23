package com.github.pigeon.products;

import com.github.pigeon.products.api.Product;
import com.github.pigeon.products.api.ProductRepository;

import java.util.List;
import java.util.Optional;

/**
 * Public facade for product queries.
 */
public class ProductQueries {
    
    private final ProductRepository productRepository;
    
    ProductQueries(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    /**
     * Retrieves a product by its id.
     * @param id the product id
     * @return Optional containing the product if found
     */
    public Optional<Product> getProduct(String id) {
        return productRepository.findById(id);
    }
    
    /**
     * Retrieves multiple products by their ids.
     * @param ids list of product ids
     * @return list of found products
     */
    public List<Product> getProducts(List<String> ids) {
        return productRepository.findByIds(ids);
    }
    
    /**
     * Retrieves a static list of recommended products for the carousel.
     * Returns 12 diverse products from different sellers and price ranges.
     * @return list of recommended products
     */
    public List<Product> getRecommendedProducts() {
        // Static list of 12 recommended products with diverse attributes
        List<String> recommendedIds = List.of(
            "prod-002",  // Wireless Mouse - Electronics Plus - 399 PLN
            "prod-006",  // Coffee Machine - Home & Garden - 899 PLN
            "prod-010",  // Yoga Mat - Sports Center - 89 PLN
            "prod-014",  // Sony Headphones - Electronics Plus - 1,499 PLN
            "prod-016",  // Air Fryer - Home & Garden - 799 PLN
            "prod-018",  // Ray-Ban Sunglasses - Fashion Hub - 599 PLN
            "prod-020",  // Protein Powder - Sports Center - 149 PLN
            "prod-023",  // Tommy Hilfiger Polo - Fashion Hub - 249 PLN
            "prod-026",  // Nespresso - Home & Garden - 699 PLN
            "prod-008",  // Levi's Jeans - Fashion Hub - 299 PLN
            "prod-015",  // Dumbbell Set - Sports Center - 199 PLN
            "prod-003"   // The Pragmatic Programmer - BookWorld - 129 PLN
        );
        return productRepository.findByIds(recommendedIds);
    }
}
