package com.github.pigeon.products.web;

import com.github.pigeon.products.ProductQueries;
import com.github.pigeon.products.api.Product;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product API for retrieving product information")
class ProductController {

    private final ProductQueries productQueries;

    ProductController(ProductQueries productQueries) {
        this.productQueries = productQueries;
    }

    @Operation(
        summary = "Get product by ID",
        description = "Retrieves a single product by its unique identifier"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Product found",
            content = @Content(schema = @Schema(implementation = Product.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    @GetMapping("/{id}")
    ResponseEntity<Product> getProduct(
        @Parameter(description = "Product ID", required = true)
        @PathVariable("id") String id
    ) {
        return productQueries.getProduct(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Get products by IDs",
        description = "Retrieves multiple products by their unique identifiers. Returns only products that exist."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Products retrieved successfully (may be empty list if none found)",
            content = @Content(schema = @Schema(implementation = Product.class))
        )
    })
    @GetMapping
    List<Product> getProducts(
        @Parameter(description = "List of product IDs", required = true)
        @RequestParam("ids") List<String> ids
    ) {
        return productQueries.getProducts(ids);
    }
}
