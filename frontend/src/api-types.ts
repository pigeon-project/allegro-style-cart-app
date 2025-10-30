/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Request to add an item to the cart */
export interface AddCartItemRequest {
  /**
   * Price per unit
   * @example 29.99
   */
  pricePerUnit: number;
  /**
   * Product image URL
   * @example "https://example.com/product.jpg"
   */
  productImage?: string;
  /**
   * Product title
   * @minLength 1
   * @example "Wireless Mouse"
   */
  productTitle: string;
  /**
   * Quantity
   * @format int32
   * @min 1
   * @max 99
   * @example 2
   */
  quantity: number;
  /**
   * Seller ID
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  sellerId: string;
}

/** Cart item response */
export interface CartItemResponse {
  /**
   * Cart ID
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  cartId?: string;
  /**
   * Item ID
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id?: string;
  /**
   * Price per unit
   * @example 29.99
   */
  pricePerUnit?: number;
  /**
   * Product image URL
   * @example "https://example.com/product.jpg"
   */
  productImage?: string;
  /**
   * Product title
   * @example "Wireless Mouse"
   */
  productTitle?: string;
  /**
   * Quantity
   * @format int32
   * @example 2
   */
  quantity?: number;
  /**
   * Seller ID
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  sellerId?: string;
  /**
   * Total price (price per unit * quantity)
   * @example 59.98
   */
  totalPrice?: number;
}

/** Cart response with all items grouped by seller */
export interface CartResponse {
  /**
   * Cart ID
   * @format uuid
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  cartId?: string;
  /** List of cart items */
  items?: CartItemResponse[];
  /**
   * User ID
   * @example "admin"
   */
  userId?: string;
}

export interface IssueCreationRequest {
  /** @minLength 1 */
  title: string;
}

export interface IssueResponse {
  id?: string;
  title?: string;
}

export interface ProblemDetail {
  detail?: string;
  /** @format uri */
  instance?: string;
  properties?: Record<string, any>;
  /** @format int32 */
  status?: number;
  title?: string;
  /** @format uri */
  type?: string;
}

/** Request with item IDs to remove, or empty to remove all */
export interface RemoveCartItemsRequest {
  /**
   * List of item IDs to remove
   * @minItems 1
   */
  itemIds: string[];
}

/** Request to update cart item quantity */
export interface UpdateCartItemRequest {
  /**
   * New quantity
   * @format int32
   * @min 1
   * @max 99
   * @example 5
   */
  quantity: number;
}
