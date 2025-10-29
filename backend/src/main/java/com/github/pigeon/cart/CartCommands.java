package com.github.pigeon.cart;

import com.github.pigeon.cart.api.CartRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartCommands {
    private final CartRepository cartRepository;

    CartCommands(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public UUID createCart(String userId) {
        return cartRepository.createCart(userId);
    }

    public UUID addCartItem(UUID cartId, UUID sellerId, String productImage, String productTitle,
                            BigDecimal pricePerUnit, int quantity) {
        return cartRepository.addCartItem(cartId, sellerId, productImage, productTitle,
                pricePerUnit, quantity);
    }

    public void updateQuantity(UUID itemId, int quantity) {
        cartRepository.updateCartItemQuantity(itemId, quantity);
    }

    public void removeItem(UUID itemId) {
        cartRepository.removeCartItem(itemId);
    }

    public void removeItems(List<UUID> itemIds) {
        cartRepository.removeCartItems(itemIds);
    }

    public void removeAllItems(UUID cartId) {
        cartRepository.removeAllCartItems(cartId);
    }

    public UUID createSeller(String name) {
        return cartRepository.createSeller(name);
    }
}
