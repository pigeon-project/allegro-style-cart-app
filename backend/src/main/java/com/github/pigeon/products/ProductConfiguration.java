package com.github.pigeon.products;

import com.github.pigeon.products.api.ProductRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class ProductConfiguration {
    
    @Bean
    ProductQueries productQueries(ProductRepository productRepository) {
        return new ProductQueries(productRepository);
    }
    
    @Bean
    ProductCommands productCommands(ProductRepository productRepository) {
        return new ProductCommands(productRepository);
    }
}
