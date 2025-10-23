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
}
