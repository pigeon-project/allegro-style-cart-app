package com.github.pigeon.products;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * JPA entity for persisting products in H2 database.
 */
@Entity
@Table(name = "products")
class PersistedProduct {
    
    @Id
    @NotBlank
    @Column(length = 100, nullable = false)
    private String id;
    
    @NotBlank
    @Column(name = "seller_id", length = 100, nullable = false)
    private String sellerId;
    
    @NotBlank
    @Column(name = "seller_name", length = 200, nullable = false)
    private String sellerName;
    
    @NotBlank
    @Column(length = 500, nullable = false)
    private String title;
    
    @NotBlank
    @Column(name = "image_url", length = 500, nullable = false)
    private String imageUrl;
    
    @Column(length = 2000)
    private String attributes;
    
    @NotNull
    @Column(name = "price_amount", nullable = false)
    private Integer priceAmount;
    
    @Column(name = "list_price_amount")
    private Integer listPriceAmount;
    
    @NotBlank
    @Column(length = 3, nullable = false)
    private String currency;
    
    @NotNull
    @Column(name = "in_stock", nullable = false)
    private Boolean inStock;
    
    @NotNull
    @Column(name = "max_orderable", nullable = false)
    private Integer maxOrderable;
    
    @Column(name = "min_qty")
    private Integer minQty;
    
    @Column(name = "max_qty")
    private Integer maxQty;
    
    protected PersistedProduct() {
    }
    
    public PersistedProduct(String id, String sellerId, String sellerName, String title, 
                           String imageUrl, String attributes, Integer priceAmount, 
                           Integer listPriceAmount, String currency, Boolean inStock, 
                           Integer maxOrderable, Integer minQty, Integer maxQty) {
        this.id = id;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.title = title;
        this.imageUrl = imageUrl;
        this.attributes = attributes;
        this.priceAmount = priceAmount;
        this.listPriceAmount = listPriceAmount;
        this.currency = currency;
        this.inStock = inStock;
        this.maxOrderable = maxOrderable;
        this.minQty = minQty;
        this.maxQty = maxQty;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getSellerId() {
        return sellerId;
    }
    
    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }
    
    public String getSellerName() {
        return sellerName;
    }
    
    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getAttributes() {
        return attributes;
    }
    
    public void setAttributes(String attributes) {
        this.attributes = attributes;
    }
    
    public Integer getPriceAmount() {
        return priceAmount;
    }
    
    public void setPriceAmount(Integer priceAmount) {
        this.priceAmount = priceAmount;
    }
    
    public Integer getListPriceAmount() {
        return listPriceAmount;
    }
    
    public void setListPriceAmount(Integer listPriceAmount) {
        this.listPriceAmount = listPriceAmount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public Boolean getInStock() {
        return inStock;
    }
    
    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }
    
    public Integer getMaxOrderable() {
        return maxOrderable;
    }
    
    public void setMaxOrderable(Integer maxOrderable) {
        this.maxOrderable = maxOrderable;
    }
    
    public Integer getMinQty() {
        return minQty;
    }
    
    public void setMinQty(Integer minQty) {
        this.minQty = minQty;
    }
    
    public Integer getMaxQty() {
        return maxQty;
    }
    
    public void setMaxQty(Integer maxQty) {
        this.maxQty = maxQty;
    }
}
