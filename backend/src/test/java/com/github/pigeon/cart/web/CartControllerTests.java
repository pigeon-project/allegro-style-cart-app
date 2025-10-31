package com.github.pigeon.cart.web;

import com.github.pigeon.cart.CartCommands;
import com.github.pigeon.cart.CartQueries;
import com.github.pigeon.cart.api.Cart;
import com.github.pigeon.cart.api.CartItem;
import com.github.pigeon.common.ProblemDetailHandler;
import com.github.pigeon.security.RateLimitFilter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = CartController.class,
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = RateLimitFilter.class)
)
@Import(ProblemDetailHandler.class)
class CartControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartQueries cartQueries;

    @MockitoBean
    private CartCommands cartCommands;

    @Nested
    @DisplayName("GET /api/cart")
    class GetCart {

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return cart with ETag when cart exists")
        void shouldReturnCartWithETag() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();

            Cart cart = new Cart(cartId, "testuser");
            CartItem item = new CartItem(
                    itemId, cartId, sellerId,
                    "http://example.com/image.jpg",
                    "Test Product",
                    new BigDecimal("29.99"),
                    2
            );

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartQueries.getCartItems(cartId)).thenReturn(List.of(item));

            mockMvc.perform(get("/api/cart"))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("ETag"))
                    .andExpect(jsonPath("$.cartId").value(cartId.toString()))
                    .andExpect(jsonPath("$.userId").value("testuser"))
                    .andExpect(jsonPath("$.items").isArray())
                    .andExpect(jsonPath("$.items[0].id").value(itemId.toString()))
                    .andExpect(jsonPath("$.items[0].productTitle").value("Test Product"))
                    .andExpect(jsonPath("$.items[0].quantity").value(2))
                    .andExpect(jsonPath("$.items[0].pricePerUnit").value(29.99))
                    .andExpect(jsonPath("$.items[0].totalPrice").value(59.98));
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should create cart when it doesn't exist")
        void shouldCreateCartWhenNotExists() throws Exception {
            UUID cartId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser"))
                    .thenReturn(Optional.empty())
                    .thenReturn(Optional.of(cart));
            when(cartCommands.createCart("testuser")).thenReturn(cartId);
            when(cartQueries.getCartItems(cartId)).thenReturn(List.of());

            mockMvc.perform(get("/api/cart"))
                    .andExpect(status().isOk())
                    .andExpect(header().exists("ETag"))
                    .andExpect(jsonPath("$.cartId").value(cartId.toString()))
                    .andExpect(jsonPath("$.userId").value("testuser"))
                    .andExpect(jsonPath("$.items").isEmpty());

            verify(cartCommands).createCart("testuser");
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/cart"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/cart/items")
    class AddItem {

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should add item to cart and return 201")
        void shouldAddItemToCart() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartCommands.addCartItem(any(), any(), any(), any(), any(), anyInt())).thenReturn(itemId);

            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productImage": "http://example.com/image.jpg",
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 2
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/api/cart/items/" + itemId));

            verify(cartCommands).addCartItem(
                    eq(cartId),
                    eq(sellerId),
                    eq("http://example.com/image.jpg"),
                    eq("Test Product"),
                    eq(new BigDecimal("29.99")),
                    eq(2)
            );
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should create cart if not exists and add item")
        void shouldCreateCartIfNotExistsAndAddItem() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser"))
                    .thenReturn(Optional.empty())
                    .thenReturn(Optional.of(cart));
            when(cartCommands.createCart("testuser")).thenReturn(cartId);
            when(cartCommands.addCartItem(any(), any(), any(), any(), any(), anyInt())).thenReturn(itemId);

            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 1
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isCreated());

            verify(cartCommands).createCart("testuser");
            verify(cartCommands).addCartItem(any(), any(), any(), any(), any(), anyInt());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 400 when sellerId is missing")
        void shouldReturn400WhenSellerIdMissing() throws Exception {
            String requestBody = """
                    {
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 1
                    }
                    """;

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.type").value("https://api.allegro-cart.com/problems/validation-error"))
                    .andExpect(jsonPath("$.title").value("Validation Error"))
                    .andExpect(jsonPath("$.errors.sellerId").exists());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 400 when productTitle is blank")
        void shouldReturn400WhenProductTitleBlank() throws Exception {
            UUID sellerId = UUID.randomUUID();
            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productTitle": "",
                        "pricePerUnit": 29.99,
                        "quantity": 1
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.productTitle").exists());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 400 when quantity is less than 1")
        void shouldReturn400WhenQuantityLessThan1() throws Exception {
            UUID sellerId = UUID.randomUUID();
            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 0
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.quantity").exists());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 400 when quantity exceeds 99")
        void shouldReturn400WhenQuantityExceeds99() throws Exception {
            UUID sellerId = UUID.randomUUID();
            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 100
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.quantity").exists());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should accept product image URLs with query parameters")
        void shouldAcceptProductImageURLsWithQueryParameters() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartCommands.addCartItem(any(), any(), any(), any(), any(), anyInt())).thenReturn(itemId);

            String requestBody = """
                    {
                        "sellerId": "%s",
                        "productImage": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
                        "productTitle": "Premium Wireless Headphones",
                        "pricePerUnit": 299.99,
                        "quantity": 1
                    }
                    """.formatted(sellerId);

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", "/api/cart/items/" + itemId));

            verify(cartCommands).addCartItem(
                    eq(cartId),
                    eq(sellerId),
                    eq("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"),
                    eq("Premium Wireless Headphones"),
                    eq(new BigDecimal("299.99")),
                    eq(1)
            );
        }

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            String requestBody = """
                    {
                        "sellerId": "123e4567-e89b-12d3-a456-426614174000",
                        "productTitle": "Test Product",
                        "pricePerUnit": 29.99,
                        "quantity": 1
                    }
                    """;

            mockMvc.perform(post("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/cart/items/{id}")
    class UpdateItemQuantity {

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should update item quantity with valid ETag")
        void shouldUpdateItemQuantityWithValidETag() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");
            CartItem item = new CartItem(
                    itemId, cartId, sellerId,
                    null, "Test Product",
                    new BigDecimal("29.99"), 2
            );

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.of(item));
            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartQueries.getCartItems(cartId)).thenReturn(List.of(item));

            // Calculate ETag properly
            int hash = cartId.hashCode();
            hash = 31 * hash + itemId.hashCode();
            hash = 31 * hash + 2; // quantity
            String etag = String.valueOf(Math.abs(hash));

            String requestBody = """
                    {
                        "quantity": 5
                    }
                    """;

            mockMvc.perform(put("/api/cart/items/" + itemId)
                            .with(csrf())
                            .header("If-Match", "\"" + etag + "\"")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isNoContent());

            verify(cartCommands).updateQuantity(itemId, 5);
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 412 when ETag doesn't match")
        void shouldReturn412WhenETagDoesntMatch() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");
            CartItem item = new CartItem(
                    itemId, cartId, sellerId,
                    null, "Test Product",
                    new BigDecimal("29.99"), 2
            );

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.of(item));
            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartQueries.getCartItems(cartId)).thenReturn(List.of(item));

            String requestBody = """
                    {
                        "quantity": 5
                    }
                    """;

            mockMvc.perform(put("/api/cart/items/" + itemId)
                            .with(csrf())
                            .header("If-Match", "\"wrong-etag\"")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isPreconditionFailed())
                    .andExpect(jsonPath("$.type").value("https://api.allegro-cart.com/problems/precondition-failed"))
                    .andExpect(jsonPath("$.title").value("Precondition Failed"));
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 404 when item not found")
        void shouldReturn404WhenItemNotFound() throws Exception {
            UUID itemId = UUID.randomUUID();

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.empty());

            String requestBody = """
                    {
                        "quantity": 5
                    }
                    """;

            mockMvc.perform(put("/api/cart/items/" + itemId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.type").value("https://api.allegro-cart.com/problems/not-found"))
                    .andExpect(jsonPath("$.title").value("Resource Not Found"));
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 404 when item belongs to different cart")
        void shouldReturn404WhenItemBelongsToDifferentCart() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID otherCartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");
            CartItem item = new CartItem(
                    itemId, otherCartId, sellerId,
                    null, "Test Product",
                    new BigDecimal("29.99"), 2
            );

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.of(item));
            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));

            String requestBody = """
                    {
                        "quantity": 5
                    }
                    """;

            mockMvc.perform(put("/api/cart/items/" + itemId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 400 when quantity is invalid")
        void shouldReturn400WhenQuantityInvalid() throws Exception {
            UUID itemId = UUID.randomUUID();

            String requestBody = """
                    {
                        "quantity": 0
                    }
                    """;

            mockMvc.perform(put("/api/cart/items/" + itemId)
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.quantity").exists());
        }
    }

    @Nested
    @DisplayName("DELETE /api/cart/items/{id}")
    class RemoveItem {

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should remove item successfully")
        void shouldRemoveItemSuccessfully() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");
            CartItem item = new CartItem(
                    itemId, cartId, sellerId,
                    null, "Test Product",
                    new BigDecimal("29.99"), 2
            );

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.of(item));
            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));

            mockMvc.perform(delete("/api/cart/items/" + itemId)
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(cartCommands).removeItem(itemId);
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 404 when item not found")
        void shouldReturn404WhenItemNotFound() throws Exception {
            UUID itemId = UUID.randomUUID();

            when(cartQueries.getCartItem(itemId)).thenReturn(Optional.empty());

            mockMvc.perform(delete("/api/cart/items/" + itemId)
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/cart/items")
    class RemoveItems {

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should remove selected items")
        void shouldRemoveSelectedItems() throws Exception {
            UUID cartId = UUID.randomUUID();
            UUID itemId1 = UUID.randomUUID();
            UUID itemId2 = UUID.randomUUID();
            UUID sellerId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");
            CartItem item1 = new CartItem(itemId1, cartId, sellerId, null, "Product 1", new BigDecimal("10.00"), 1);
            CartItem item2 = new CartItem(itemId2, cartId, sellerId, null, "Product 2", new BigDecimal("20.00"), 1);

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));
            when(cartQueries.getCartItem(itemId1)).thenReturn(Optional.of(item1));
            when(cartQueries.getCartItem(itemId2)).thenReturn(Optional.of(item2));

            String requestBody = """
                    {
                        "itemIds": ["%s", "%s"]
                    }
                    """.formatted(itemId1, itemId2);

            mockMvc.perform(delete("/api/cart/items")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isNoContent());

            verify(cartCommands).removeItems(List.of(itemId1, itemId2));
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should remove all items when all=true")
        void shouldRemoveAllItemsWhenAllTrue() throws Exception {
            UUID cartId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));

            mockMvc.perform(delete("/api/cart/items")
                            .with(csrf())
                            .param("all", "true"))
                    .andExpect(status().isNoContent());

            verify(cartCommands).removeAllItems(cartId);
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should remove all items when request body is empty")
        void shouldRemoveAllItemsWhenRequestBodyEmpty() throws Exception {
            UUID cartId = UUID.randomUUID();
            Cart cart = new Cart(cartId, "testuser");

            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.of(cart));

            mockMvc.perform(delete("/api/cart/items")
                            .with(csrf()))
                    .andExpect(status().isNoContent());

            verify(cartCommands).removeAllItems(cartId);
        }

        @Test
        @WithMockUser(value = "testuser")
        @DisplayName("Should return 404 when cart not found")
        void shouldReturn404WhenCartNotFound() throws Exception {
            when(cartQueries.getCartByUserId("testuser")).thenReturn(Optional.empty());

            mockMvc.perform(delete("/api/cart/items")
                            .with(csrf())
                            .param("all", "true"))
                    .andExpect(status().isNotFound());
        }
    }
}
