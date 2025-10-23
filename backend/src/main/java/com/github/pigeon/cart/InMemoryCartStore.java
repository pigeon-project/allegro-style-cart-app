package com.github.pigeon.cart;

import com.github.pigeon.cart.api.CartSnapshot;
import com.github.pigeon.cart.api.CartStore;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * In-memory implementation of CartStore using ConcurrentHashMap.
 * Provides thread-safe temporary storage for cart snapshots.
 */
class InMemoryCartStore implements CartStore {
    
    private final ConcurrentMap<String, CartSnapshot> carts = new ConcurrentHashMap<>();
    
    @Override
    public Optional<CartSnapshot> getCart(String cartId) {
        return Optional.ofNullable(carts.get(cartId));
    }
    
    @Override
    public void saveCart(CartSnapshot snapshot) {
        carts.put(snapshot.cartId(), snapshot);
    }
    
    @Override
    public void removeCart(String cartId) {
        carts.remove(cartId);
    }
}
