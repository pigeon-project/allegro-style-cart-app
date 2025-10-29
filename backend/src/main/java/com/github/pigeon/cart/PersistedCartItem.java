package com.github.pigeon.cart;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.PersistenceCreator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cart_items", indexes = {
        @Index(name = "idx_cart_items_cart_id", columnList = "cart_id"),
        @Index(name = "idx_cart_items_seller_id", columnList = "seller_id")
})
class PersistedCartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Cart ID cannot be null")
    @Column(name = "cart_id", nullable = false)
    private UUID cartId;

    @NotNull(message = "Seller ID cannot be null")
    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "product_image", length = 500)
    private String productImage;

    @NotBlank(message = "Product title cannot be blank")
    @Column(name = "product_title", nullable = false, length = 500)
    private String productTitle;

    @NotNull(message = "Price per unit cannot be null")
    @Column(name = "price_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    @Min(value = 1, message = "Quantity must be at least 1")
    @Max(value = 99, message = "Quantity must not exceed 99")
    @Column(nullable = false)
    private int quantity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    @PersistenceCreator
    public PersistedCartItem() {
    }

    public PersistedCartItem(UUID cartId, UUID sellerId, String productImage, String productTitle,
                             BigDecimal pricePerUnit, int quantity) {
        this.cartId = cartId;
        this.sellerId = sellerId;
        this.productImage = productImage;
        this.productTitle = productTitle;
        this.pricePerUnit = pricePerUnit;
        this.quantity = quantity;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCartId() {
        return cartId;
    }

    public void setCartId(UUID cartId) {
        this.cartId = cartId;
    }

    public UUID getSellerId() {
        return sellerId;
    }

    public void setSellerId(UUID sellerId) {
        this.sellerId = sellerId;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public String getProductTitle() {
        return productTitle;
    }

    public void setProductTitle(String productTitle) {
        this.productTitle = productTitle;
    }

    public BigDecimal getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(BigDecimal pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
