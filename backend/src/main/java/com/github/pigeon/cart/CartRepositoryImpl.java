package com.github.pigeon.cart;

import com.github.pigeon.cart.api.Cart;
import com.github.pigeon.cart.api.CartItem;
import com.github.pigeon.cart.api.CartRepository;
import com.github.pigeon.cart.api.Seller;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

class CartRepositoryImpl implements CartRepository {
    private final PersistedCartRepository persistedCartRepository;
    private final PersistedCartItemRepository persistedCartItemRepository;
    private final PersistedSellerRepository persistedSellerRepository;

    CartRepositoryImpl(PersistedCartRepository persistedCartRepository,
                       PersistedCartItemRepository persistedCartItemRepository,
                       PersistedSellerRepository persistedSellerRepository) {
        this.persistedCartRepository = persistedCartRepository;
        this.persistedCartItemRepository = persistedCartItemRepository;
        this.persistedSellerRepository = persistedSellerRepository;
    }

    @Override
    public Optional<Cart> findCartByUserId(String userId) {
        return persistedCartRepository.findByUserId(userId)
                .map(this::toDomain);
    }

    @Override
    public UUID createCart(String userId) {
        PersistedCart cart = new PersistedCart(userId);
        return persistedCartRepository.save(cart).getId();
    }

    @Override
    public Optional<CartItem> findCartItemById(UUID itemId) {
        return persistedCartItemRepository.findById(itemId)
                .map(this::toDomain);
    }

    @Override
    public List<CartItem> findCartItemsByCartId(UUID cartId) {
        return persistedCartItemRepository.findByCartId(cartId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public List<CartItem> findCartItemsByCartIdAndSellerId(UUID cartId, UUID sellerId) {
        return persistedCartItemRepository.findByCartIdAndSellerId(cartId, sellerId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public UUID addCartItem(UUID cartId, UUID sellerId, String productImage, String productTitle,
                            BigDecimal pricePerUnit, int quantity) {
        PersistedCartItem item = new PersistedCartItem(cartId, sellerId, productImage, productTitle,
                pricePerUnit, quantity);
        return persistedCartItemRepository.save(item).getId();
    }

    @Override
    @Transactional
    public void updateCartItemQuantity(UUID itemId, int quantity) {
        persistedCartItemRepository.findById(itemId).ifPresent(item -> {
            item.setQuantity(quantity);
            persistedCartItemRepository.save(item);
        });
    }

    @Override
    @Transactional
    public void removeCartItem(UUID itemId) {
        persistedCartItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public void removeCartItems(List<UUID> itemIds) {
        persistedCartItemRepository.deleteByIdIn(itemIds);
    }

    @Override
    @Transactional
    public void removeAllCartItems(UUID cartId) {
        persistedCartItemRepository.deleteByCartId(cartId);
    }

    @Override
    public Optional<Seller> findSellerById(UUID sellerId) {
        return persistedSellerRepository.findById(sellerId)
                .map(this::toDomain);
    }

    @Override
    public List<Seller> findSellersByCartId(UUID cartId) {
        List<UUID> sellerIds = persistedCartItemRepository.findDistinctSellerIdsByCartId(cartId);
        return sellerIds.stream()
                .map(persistedSellerRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(this::toDomain)
                .toList();
    }

    @Override
    public UUID createSeller(String name) {
        PersistedSeller seller = new PersistedSeller(name);
        return persistedSellerRepository.save(seller).getId();
    }

    private Cart toDomain(PersistedCart persisted) {
        return new Cart(persisted.getId(), persisted.getUserId());
    }

    private CartItem toDomain(PersistedCartItem persisted) {
        return new CartItem(
                persisted.getId(),
                persisted.getCartId(),
                persisted.getSellerId(),
                persisted.getProductImage(),
                persisted.getProductTitle(),
                persisted.getPricePerUnit(),
                persisted.getQuantity()
        );
    }

    private Seller toDomain(PersistedSeller persisted) {
        return new Seller(persisted.getId(), persisted.getName());
    }
}
