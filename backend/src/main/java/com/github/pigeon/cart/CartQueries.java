package com.github.pigeon.cart;

import com.github.pigeon.cart.api.Cart;
import com.github.pigeon.cart.api.CartItem;
import com.github.pigeon.cart.api.CartRepository;
import com.github.pigeon.cart.api.Seller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class CartQueries {
    private final CartRepository cartRepository;

    CartQueries(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Optional<Cart> getCartByUserId(String userId) {
        return cartRepository.findCartByUserId(userId);
    }

    public Optional<CartItem> getCartItem(UUID itemId) {
        return cartRepository.findCartItemById(itemId);
    }

    public List<CartItem> getCartItems(UUID cartId) {
        return cartRepository.findCartItemsByCartId(cartId);
    }

    public List<CartItem> getCartItemsBySeller(UUID cartId, UUID sellerId) {
        return cartRepository.findCartItemsByCartIdAndSellerId(cartId, sellerId);
    }

    public Optional<Seller> getSeller(UUID sellerId) {
        return cartRepository.findSellerById(sellerId);
    }

    public List<Seller> getSellersByCart(UUID cartId) {
        return cartRepository.findSellersByCartId(cartId);
    }
}
