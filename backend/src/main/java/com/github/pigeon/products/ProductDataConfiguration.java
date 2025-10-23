package com.github.pigeon.products;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

/**
 * Seeds the database with mock product data for testing.
 */
@Configuration
class ProductDataConfiguration {
    
    @Bean
    CommandLineRunner seedProducts(PersistedProductRepository repository, ObjectMapper objectMapper) {
        return args -> {
            if (repository.count() == 0) {
                List<PersistedProduct> products = List.of(
                    createProduct("prod-001", "seller-001", "Electronics Plus", "Laptop Dell XPS 15", 
                        "https://picsum.photos/seed/laptop1/300/300", 
                        createAttributes(Map.of("RAM", "16GB", "Storage", "512GB SSD")), objectMapper,
                        599900, 699900, true, 15, 1, 5),
                    createProduct("prod-002", "seller-001", "Electronics Plus", "Wireless Mouse Logitech MX Master 3", 
                        "https://picsum.photos/seed/mouse1/300/300", 
                        createAttributes(Map.of("Type", "Wireless", "Color", "Black")), objectMapper,
                        39900, 49900, true, 50, 1, 10),
                    createProduct("prod-003", "seller-002", "BookWorld", "The Pragmatic Programmer", 
                        "https://picsum.photos/seed/book1/300/300", 
                        createAttributes(Map.of("Author", "David Thomas", "Pages", "352")), objectMapper,
                        12900, null, true, 100, 1, 99),
                    createProduct("prod-004", "seller-003", "Fashion Hub", "Nike Air Max Running Shoes", 
                        "https://picsum.photos/seed/shoes1/300/300", 
                        createAttributes(Map.of("Size", "42", "Color", "Blue/White")), objectMapper,
                        45900, 59900, true, 25, 1, 3),
                    createProduct("prod-005", "seller-001", "Electronics Plus", "iPhone 15 Pro 256GB", 
                        "https://picsum.photos/seed/phone1/300/300", 
                        createAttributes(Map.of("Storage", "256GB", "Color", "Titanium")), objectMapper,
                        529900, 549900, true, 8, 1, 2),
                    createProduct("prod-006", "seller-004", "Home & Garden", "Coffee Machine DeLonghi", 
                        "https://picsum.photos/seed/coffee1/300/300", 
                        createAttributes(Map.of("Type", "Automatic", "Capacity", "1.8L")), objectMapper,
                        89900, 119900, true, 12, 1, 5),
                    createProduct("prod-007", "seller-002", "BookWorld", "Clean Code by Robert Martin", 
                        "https://picsum.photos/seed/book2/300/300", 
                        createAttributes(Map.of("Author", "Robert Martin", "Pages", "464")), objectMapper,
                        14900, null, true, 75, 1, 99),
                    createProduct("prod-008", "seller-003", "Fashion Hub", "Levi's 501 Original Jeans", 
                        "https://picsum.photos/seed/jeans1/300/300", 
                        createAttributes(Map.of("Size", "32/34", "Color", "Dark Blue")), objectMapper,
                        29900, 35900, true, 40, 1, 5),
                    createProduct("prod-009", "seller-001", "Electronics Plus", "Samsung 4K Monitor 32\"", 
                        "https://picsum.photos/seed/monitor1/300/300", 
                        createAttributes(Map.of("Size", "32 inch", "Resolution", "3840x2160")), objectMapper,
                        149900, 199900, true, 10, 1, 3),
                    createProduct("prod-010", "seller-005", "Sports Center", "Yoga Mat Premium", 
                        "https://picsum.photos/seed/yoga1/300/300", 
                        createAttributes(Map.of("Material", "TPE", "Size", "183x61cm")), objectMapper,
                        8900, 12900, true, 200, 1, 10),
                    createProduct("prod-011", "seller-004", "Home & Garden", "Dyson V15 Vacuum Cleaner", 
                        "https://picsum.photos/seed/vacuum1/300/300", 
                        createAttributes(Map.of("Type", "Cordless", "Power", "230W")), objectMapper,
                        249900, 299900, true, 5, 1, 2),
                    createProduct("prod-012", "seller-002", "BookWorld", "Design Patterns by Gang of Four", 
                        "https://picsum.photos/seed/book3/300/300", 
                        createAttributes(Map.of("Author", "Gang of Four", "Pages", "395")), objectMapper,
                        16900, null, true, 60, 1, 99),
                    createProduct("prod-013", "seller-003", "Fashion Hub", "Adidas Ultraboost 22", 
                        "https://picsum.photos/seed/shoes2/300/300", 
                        createAttributes(Map.of("Size", "43", "Color", "Black")), objectMapper,
                        69900, 79900, true, 18, 1, 3),
                    createProduct("prod-014", "seller-001", "Electronics Plus", "Sony WH-1000XM5 Headphones", 
                        "https://picsum.photos/seed/headphones1/300/300", 
                        createAttributes(Map.of("Type", "Over-ear", "Noise Cancelling", "Yes")), objectMapper,
                        149900, 179900, true, 30, 1, 5),
                    createProduct("prod-015", "seller-005", "Sports Center", "Dumbbell Set 20kg", 
                        "https://picsum.photos/seed/dumbbell1/300/300", 
                        createAttributes(Map.of("Weight", "20kg", "Material", "Cast Iron")), objectMapper,
                        19900, 24900, true, 15, 1, 5),
                    createProduct("prod-016", "seller-004", "Home & Garden", "Philips Air Fryer XXL", 
                        "https://picsum.photos/seed/airfryer1/300/300", 
                        createAttributes(Map.of("Capacity", "7.3L", "Power", "2200W")), objectMapper,
                        79900, 99900, true, 20, 1, 3),
                    createProduct("prod-017", "seller-002", "BookWorld", "Refactoring by Martin Fowler", 
                        "https://picsum.photos/seed/book4/300/300", 
                        createAttributes(Map.of("Author", "Martin Fowler", "Pages", "448")), objectMapper,
                        15900, null, true, 45, 1, 99),
                    createProduct("prod-018", "seller-003", "Fashion Hub", "Ray-Ban Aviator Sunglasses", 
                        "https://picsum.photos/seed/sunglasses1/300/300", 
                        createAttributes(Map.of("Color", "Gold/Green", "Lens", "Polarized")), objectMapper,
                        59900, 69900, true, 35, 1, 3),
                    createProduct("prod-019", "seller-001", "Electronics Plus", "iPad Air 5th Gen 256GB", 
                        "https://picsum.photos/seed/tablet1/300/300", 
                        createAttributes(Map.of("Storage", "256GB", "Color", "Space Gray")), objectMapper,
                        329900, 349900, true, 12, 1, 2),
                    createProduct("prod-020", "seller-005", "Sports Center", "Protein Powder Whey 2kg", 
                        "https://picsum.photos/seed/protein1/300/300", 
                        createAttributes(Map.of("Flavor", "Chocolate", "Weight", "2kg")), objectMapper,
                        14900, 17900, true, 150, 1, 10),
                    createProduct("prod-021", "seller-004", "Home & Garden", "Robot Vacuum Roborock S7", 
                        "https://picsum.photos/seed/robot1/300/300", 
                        createAttributes(Map.of("Type", "Robot", "Features", "Mopping + Vacuum")), objectMapper,
                        189900, 229900, false, 0, 1, 2),
                    createProduct("prod-022", "seller-002", "BookWorld", "Domain-Driven Design by Eric Evans", 
                        "https://picsum.photos/seed/book5/300/300", 
                        createAttributes(Map.of("Author", "Eric Evans", "Pages", "560")), objectMapper,
                        18900, null, true, 30, 1, 99),
                    createProduct("prod-023", "seller-003", "Fashion Hub", "Tommy Hilfiger Polo Shirt", 
                        "https://picsum.photos/seed/polo1/300/300", 
                        createAttributes(Map.of("Size", "L", "Color", "Navy Blue")), objectMapper,
                        24900, 32900, true, 55, 1, 5),
                    createProduct("prod-024", "seller-001", "Electronics Plus", "GoPro Hero 12 Black", 
                        "https://picsum.photos/seed/gopro1/300/300", 
                        createAttributes(Map.of("Resolution", "5.3K", "Waterproof", "10m")), objectMapper,
                        199900, 229900, true, 8, 1, 3),
                    createProduct("prod-025", "seller-005", "Sports Center", "Tennis Racket Wilson Pro Staff", 
                        "https://picsum.photos/seed/tennis1/300/300", 
                        createAttributes(Map.of("Weight", "315g", "Grip Size", "3")), objectMapper,
                        89900, 109900, true, 10, 1, 2),
                    createProduct("prod-026", "seller-004", "Home & Garden", "Nespresso Vertuo Plus", 
                        "https://picsum.photos/seed/nespresso1/300/300", 
                        createAttributes(Map.of("Type", "Capsule", "Color", "Chrome")), objectMapper,
                        69900, 84900, true, 25, 1, 3),
                    createProduct("prod-027", "seller-002", "BookWorld", "The Art of Computer Programming Vol 1", 
                        "https://picsum.photos/seed/book6/300/300", 
                        createAttributes(Map.of("Author", "Donald Knuth", "Pages", "672")), objectMapper,
                        24900, null, true, 20, 1, 99),
                    createProduct("prod-028", "seller-003", "Fashion Hub", "North Face Fleece Jacket", 
                        "https://picsum.photos/seed/jacket1/300/300", 
                        createAttributes(Map.of("Size", "M", "Color", "Black")), objectMapper,
                        39900, 49900, true, 30, 1, 5),
                    createProduct("prod-029", "seller-001", "Electronics Plus", "Nintendo Switch OLED", 
                        "https://picsum.photos/seed/switch1/300/300", 
                        createAttributes(Map.of("Model", "OLED", "Color", "Neon")), objectMapper,
                        159900, 179900, true, 15, 1, 2),
                    createProduct("prod-030", "seller-005", "Sports Center", "Bicycle Mountain Bike 29\"", 
                        "https://picsum.photos/seed/bike1/300/300", 
                        createAttributes(Map.of("Size", "29 inch", "Gears", "21-speed")), objectMapper,
                        129900, 159900, true, 5, 1, 1)
                );
                
                repository.saveAll(products);
            }
        };
    }
    
    private PersistedProduct createProduct(String id, String sellerId, String sellerName, String title,
                                          String imageUrl, String attributes, ObjectMapper objectMapper,
                                          int priceAmount, Integer listPriceAmount, boolean inStock,
                                          int maxOrderable, int minQty, int maxQty) {
        return new PersistedProduct(
            id, sellerId, sellerName, title, imageUrl, attributes,
            priceAmount, listPriceAmount, "PLN", inStock, maxOrderable, minQty, maxQty
        );
    }
    
    private String createAttributes(Map<String, String> attrs) {
        try {
            return new ObjectMapper().writeValueAsString(
                attrs.entrySet().stream()
                    .map(e -> Map.of("name", e.getKey(), "value", e.getValue()))
                    .toList()
            );
        } catch (Exception e) {
            return null;
        }
    }
}
