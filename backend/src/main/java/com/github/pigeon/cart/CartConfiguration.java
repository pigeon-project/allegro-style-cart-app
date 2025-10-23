package com.github.pigeon.cart;

import com.github.pigeon.cart.api.CartRepository;
import com.github.pigeon.products.api.ProductRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class CartConfiguration {
    
    @Bean
    CartRepository cartRepository(ProductRepository productRepository) {
        return new CartRepositoryImpl(productRepository);
    }
}
