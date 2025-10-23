package com.github.pigeon.products.api;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for product operations.
 */
public interface ProductRepository {
    
    /**
     * Finds a product by its id.
     * @param id the product id
     * @return Optional containing the product if found
     */
    Optional<Product> findById(String id);
    
    /**
     * Finds products by their ids.
     * @param ids list of product ids
     * @return list of found products
     */
    List<Product> findByIds(List<String> ids);
}
