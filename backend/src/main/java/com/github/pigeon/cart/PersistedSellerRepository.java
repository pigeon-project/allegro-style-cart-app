package com.github.pigeon.cart;

import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

interface PersistedSellerRepository extends CrudRepository<PersistedSeller, UUID> {
    Optional<PersistedSeller> findByName(String name);
}
