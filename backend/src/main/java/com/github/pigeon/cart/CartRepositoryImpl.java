package com.github.pigeon.cart;

import com.github.pigeon.cart.api.*;
import com.github.pigeon.products.api.Money;
import com.github.pigeon.products.api.Product;
import com.github.pigeon.products.api.ProductRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Stateless implementation of CartRepository.
 * This implementation does NOT persist cart state.
 * It validates prices and availability against the Product catalog.
 */
class CartRepositoryImpl implements CartRepository {
    
    private final ProductRepository productRepository;
    
    CartRepositoryImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    @Override
    public QuoteResponse calculateQuote(QuoteRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Quote request cannot be null");
        }
        
        // Fetch all products in one batch query
        List<String> productIds = request.items().stream()
                .map(QuoteRequest.QuoteItem::productId)
                .toList();
        
        List<Product> products = productRepository.findByIds(productIds);
        Map<String, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::id, p -> p));
        
        // Build cart items with validated prices and availability
        List<CartItem> cartItems = new ArrayList<>();
        for (QuoteRequest.QuoteItem quoteItem : request.items()) {
            Product product = productMap.get(quoteItem.productId());
            
            if (product == null) {
                throw new IllegalArgumentException("Product not found: " + quoteItem.productId());
            }
            
            // Validate and clip quantity based on product constraints and availability
            int validatedQuantity = QuantityValidator.validateAndClip(
                    quoteItem.quantity(),
                    product.minQty(),
                    product.maxQty(),
                    product.availability()
            );
            
            // Skip items with zero quantity (out of stock or unavailable)
            if (validatedQuantity == 0) {
                continue;
            }
            
            // Create cart item with validated data from product catalog
            CartItem cartItem = new CartItem(
                    UUID.randomUUID().toString(),
                    product.id(),
                    validatedQuantity,
                    product.price(),
                    product.listPrice()
            );
            
            cartItems.add(cartItem);
        }
        
        // Calculate totals
        Money subtotal = CartCalculations.calculateSubtotal(cartItems);
        Money delivery = new Money(0, "PLN"); // Default delivery cost is 0
        Money total = CartCalculations.calculateGrandTotal(subtotal, delivery);
        
        CartComputed computed = new CartComputed(subtotal, delivery, total);
        
        return new QuoteResponse(request.cartId(), cartItems, computed);
    }
}
