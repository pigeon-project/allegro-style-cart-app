package com.github.pigeon.products;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for products.
 */
interface PersistedProductRepository extends JpaRepository<PersistedProduct, String> {
    
    /**
     * Find products by their IDs using a single query to avoid N+1 problem.
     * @param ids list of product IDs
     * @return list of products
     */
    @Query("SELECT p FROM PersistedProduct p WHERE p.id IN :ids")
    List<PersistedProduct> findByIdIn(@Param("ids") List<String> ids);
}
