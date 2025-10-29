package com.github.pigeon.cart.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CartRepository {
    Optional<Cart> findCartByUserId(String userId);

    UUID createCart(String userId);

    Optional<CartItem> findCartItemById(UUID itemId);

    List<CartItem> findCartItemsByCartId(UUID cartId);

    List<CartItem> findCartItemsByCartIdAndSellerId(UUID cartId, UUID sellerId);

    UUID addCartItem(UUID cartId, UUID sellerId, String productImage, String productTitle,
                     BigDecimal pricePerUnit, int quantity);

    void updateCartItemQuantity(UUID itemId, int quantity);

    void removeCartItem(UUID itemId);

    void removeCartItems(List<UUID> itemIds);

    void removeAllCartItems(UUID cartId);

    Optional<Seller> findSellerById(UUID sellerId);

    List<Seller> findSellersByCartId(UUID cartId);

    UUID createSeller(String name);
}
