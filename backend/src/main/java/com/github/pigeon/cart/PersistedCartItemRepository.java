package com.github.pigeon.cart;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

interface PersistedCartItemRepository extends CrudRepository<PersistedCartItem, UUID> {
    List<PersistedCartItem> findByCartId(UUID cartId);

    List<PersistedCartItem> findByCartIdAndSellerId(UUID cartId, UUID sellerId);

    void deleteByIdIn(List<UUID> ids);

    void deleteByCartId(UUID cartId);

    @Query("SELECT DISTINCT ci.sellerId FROM PersistedCartItem ci WHERE ci.cartId = :cartId")
    List<UUID> findDistinctSellerIdsByCartId(@Param("cartId") UUID cartId);
}
