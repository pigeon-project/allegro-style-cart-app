package com.github.pigeon.products;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pigeon.products.api.Availability;
import com.github.pigeon.products.api.Money;
import com.github.pigeon.products.api.Product;
import com.github.pigeon.products.api.ProductRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementation of ProductRepository using JPA.
 */
class ProductRepositoryImpl implements ProductRepository {
    
    private final PersistedProductRepository persistedProductRepository;
    private final ObjectMapper objectMapper;
    
    ProductRepositoryImpl(PersistedProductRepository persistedProductRepository, ObjectMapper objectMapper) {
        this.persistedProductRepository = persistedProductRepository;
        this.objectMapper = objectMapper;
    }
    
    @Override
    public Optional<Product> findById(String id) {
        return persistedProductRepository.findById(id)
                .map(this::toDomain);
    }
    
    @Override
    public List<Product> findByIds(List<String> ids) {
        return persistedProductRepository.findByIdIn(ids)
                .stream()
                .map(this::toDomain)
                .toList();
    }
    
    private Product toDomain(PersistedProduct persisted) {
        List<Map<String, String>> attributes = null;
        if (persisted.getAttributes() != null && !persisted.getAttributes().isBlank()) {
            try {
                attributes = objectMapper.readValue(
                    persisted.getAttributes(), 
                    new TypeReference<List<Map<String, String>>>() {}
                );
            } catch (JsonProcessingException e) {
                // If JSON parsing fails, leave attributes as null
            }
        }
        
        Money listPrice = null;
        if (persisted.getListPriceAmount() != null) {
            listPrice = new Money(persisted.getListPriceAmount(), persisted.getCurrency());
        }
        
        return new Product(
            persisted.getId(),
            persisted.getSellerId(),
            persisted.getSellerName(),
            persisted.getTitle(),
            persisted.getImageUrl(),
            attributes,
            new Money(persisted.getPriceAmount(), persisted.getCurrency()),
            listPrice,
            persisted.getCurrency(),
            new Availability(persisted.getInStock(), persisted.getMaxOrderable()),
            persisted.getMinQty(),
            persisted.getMaxQty()
        );
    }
}
