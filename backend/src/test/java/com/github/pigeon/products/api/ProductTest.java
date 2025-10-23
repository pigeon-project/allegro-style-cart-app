package com.github.pigeon.products.api;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    @Test
    @DisplayName("Should create Product with all required fields")
    void shouldCreateValidProduct() {
        Money price = new Money(10000, "PLN");
        Money listPrice = new Money(15000, "PLN");
        Availability availability = new Availability(true, 50);
        List<Map<String, String>> attributes = List.of(
            Map.of("name", "Color", "value", "Red")
        );
        
        Product product = new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            attributes,
            price,
            listPrice,
            "PLN",
            availability,
            1,
            99
        );
        
        assertEquals("prod-123", product.id());
        assertEquals("seller-456", product.sellerId());
        assertEquals("Test Seller", product.sellerName());
        assertEquals("Test Product", product.title());
        assertEquals("https://example.com/image.jpg", product.imageUrl());
        assertEquals(attributes, product.attributes());
        assertEquals(price, product.price());
        assertEquals(listPrice, product.listPrice());
        assertEquals("PLN", product.currency());
        assertEquals(availability, product.availability());
        assertEquals(1, product.minQty());
        assertEquals(99, product.maxQty());
    }

    @Test
    @DisplayName("Should create Product with null optional fields")
    void shouldCreateProductWithNullOptionalFields() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        Product product = new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        );
        
        assertNotNull(product);
        assertNull(product.attributes());
        assertNull(product.listPrice());
        assertNull(product.minQty());
        assertNull(product.maxQty());
    }

    @Test
    @DisplayName("Should reject null id")
    void shouldRejectNullId() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            null,
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject blank id")
    void shouldRejectBlankId() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "  ",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null seller id")
    void shouldRejectNullSellerId() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            null,
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null seller name")
    void shouldRejectNullSellerName() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            null,
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null title")
    void shouldRejectNullTitle() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            null,
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null image URL")
    void shouldRejectNullImageUrl() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            null,
            null,
            price,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null price")
    void shouldRejectNullPrice() {
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            null,
            null,
            "PLN",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null currency")
    void shouldRejectNullCurrency() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            null,
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject non-PLN currency")
    void shouldRejectNonPLNCurrency() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "USD",
            availability,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject null availability")
    void shouldRejectNullAvailability() {
        Money price = new Money(10000, "PLN");
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            null,
            null,
            null
        ));
    }

    @Test
    @DisplayName("Should reject zero or negative min quantity")
    void shouldRejectInvalidMinQuantity() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            0,
            99
        ));
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            -1,
            99
        ));
    }

    @Test
    @DisplayName("Should reject zero or negative max quantity")
    void shouldRejectInvalidMaxQuantity() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            1,
            0
        ));
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            1,
            -1
        ));
    }

    @Test
    @DisplayName("Should reject min quantity greater than max quantity")
    void shouldRejectMinGreaterThanMax() {
        Money price = new Money(10000, "PLN");
        Availability availability = new Availability(true, 50);
        
        assertThrows(IllegalArgumentException.class, () -> new Product(
            "prod-123",
            "seller-456",
            "Test Seller",
            "Test Product",
            "https://example.com/image.jpg",
            null,
            price,
            null,
            "PLN",
            availability,
            10,
            5
        ));
    }
}
