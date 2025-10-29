package com.github.pigeon.cart;

import com.github.pigeon.cart.api.CartRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class CartConfiguration {

    @Bean
    CartQueries cartQueries(CartRepository cartRepository) {
        return new CartQueries(cartRepository);
    }

    @Bean
    CartCommands cartCommands(CartRepository cartRepository) {
        return new CartCommands(cartRepository);
    }

    @Bean
    CartRepository cartRepository(PersistedCartRepository persistedCartRepository,
                                  PersistedCartItemRepository persistedCartItemRepository,
                                  PersistedSellerRepository persistedSellerRepository) {
        return new CartRepositoryImpl(persistedCartRepository, persistedCartItemRepository,
                persistedSellerRepository);
    }
}
