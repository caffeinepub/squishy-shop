import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SellerProductSubmission {
    seller: Principal;
    approvalStatus: ApprovalStatus;
    product: Product;
}
export interface Order {
    id: bigint;
    paymentStatus: string;
    userId: Principal;
    totalAmount: bigint;
    shippingAddress: string;
    items: Array<CartItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
    variant: string;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    variants: Array<string>;
    price: bigint;
    images: Array<string>;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<bigint>;
    addToCart(item: CartItem): Promise<void>;
    approveProductSubmission(submissionId: bigint, approvalStatus: ApprovalStatus): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(address: string, items: Array<CartItem>, total: bigint): Promise<bigint>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProductSubmissions(): Promise<Array<SellerProductSubmission>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order>;
    getProduct(productId: bigint): Promise<Product>;
    getSellerSubmissions(seller: Principal): Promise<Array<SellerProductSubmission>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    removeFromCart(productId: bigint): Promise<void>;
    removeProduct(productId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitProductForApproval(product: Product): Promise<bigint>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
