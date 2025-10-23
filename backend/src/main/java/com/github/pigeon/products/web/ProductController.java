package com.github.pigeon.products.web;

import com.github.pigeon.products.ProductQueries;
import com.github.pigeon.products.api.Product;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
class ProductController {

    private final ProductQueries productQueries;

    ProductController(ProductQueries productQueries) {
        this.productQueries = productQueries;
    }

    @GetMapping("/{id}")
    ResponseEntity<Product> getProduct(@PathVariable("id") String id) {
        return productQueries.getProduct(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    List<Product> getProducts(@RequestParam("ids") List<String> ids) {
        return productQueries.getProducts(ids);
    }
}
