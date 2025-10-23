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

export interface AddItemRequest {
  /** @minLength 1 */
  productId: string;
  /** @format int32 */
  quantity?: number;
}

export interface Availability {
  inStock?: boolean;
  /** @format int32 */
  maxOrderable?: number;
}

export interface CartComputed {
  delivery?: Money;
  subtotal?: Money;
  total?: Money;
}

export interface CartItem {
  itemId?: string;
  listPrice?: Money;
  price?: Money;
  productId?: string;
  /** @format int32 */
  quantity?: number;
}

export interface IssueCreationRequest {
  /** @minLength 1 */
  title: string;
}

export interface IssueResponse {
  id?: string;
  title?: string;
}

export interface Money {
  /** @format int32 */
  amount?: number;
  currency?: string;
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

export interface Product {
  attributes?: Record<string, string>[];
  availability?: Availability;
  currency?: string;
  id?: string;
  imageUrl?: string;
  listPrice?: Money;
  /** @format int32 */
  maxQty?: number;
  /** @format int32 */
  minQty?: number;
  price?: Money;
  sellerId?: string;
  sellerName?: string;
  title?: string;
}

export interface QuoteItem {
  productId?: string;
  /** @format int32 */
  quantity?: number;
}

export interface QuoteRequest {
  cartId?: string;
  items?: QuoteItem[];
}

export interface QuoteResponse {
  cartId?: string;
  computed?: CartComputed;
  items?: CartItem[];
}

export interface UpdateItemRequest {
  /** @format int32 */
  quantity?: number;
}
