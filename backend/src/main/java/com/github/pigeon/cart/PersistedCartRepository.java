package com.github.pigeon.cart;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

interface PersistedCartRepository extends CrudRepository<PersistedCart, UUID> {
    Optional<PersistedCart> findByUserId(String userId);
}
