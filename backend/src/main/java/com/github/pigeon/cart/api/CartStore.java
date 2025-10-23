package com.github.pigeon.cart.api;

import java.util.Optional;

/**
 * Service for managing cart state in memory.
 * Provides temporary storage for cart snapshots to support stateless REST API.
 */
public interface CartStore {
    
    /**
     * Retrieves a cart snapshot by ID.
     * 
     * @param cartId the cart identifier
     * @return optional containing the cart snapshot if found
     */
    Optional<CartSnapshot> getCart(String cartId);
    
    /**
     * Saves or updates a cart snapshot.
     * 
     * @param snapshot the cart snapshot to save
     */
    void saveCart(CartSnapshot snapshot);
    
    /**
     * Removes a cart from storage.
     * 
     * @param cartId the cart identifier
     */
    void removeCart(String cartId);
}
