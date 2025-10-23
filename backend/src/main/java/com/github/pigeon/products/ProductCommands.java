package com.github.pigeon.products;

import com.github.pigeon.products.api.ProductRepository;

/**
 * Public facade for product commands.
 * Currently minimal as products are read-only from the backend perspective.
 */
public class ProductCommands {
    
    private final ProductRepository productRepository;
    
    ProductCommands(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
