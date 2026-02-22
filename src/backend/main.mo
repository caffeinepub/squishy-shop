import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Include storage mixin
  include MixinStorage();

  // Include authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    images : [Text];
    variants : [Text];
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
    variant : Text;
  };

  public type Order = {
    id : Nat;
    userId : Principal;
    items : [CartItem];
    shippingAddress : Text;
    totalAmount : Nat;
    paymentStatus : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type SellerProductSubmission = {
    product : Product;
    seller : Principal;
    approvalStatus : ApprovalStatus;
  };

  public type ApprovalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  // State
  var nextProductId = 1;
  var nextOrderId = 1;
  var nextSubmissionId = 1;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let carts = Map.empty<Principal, [CartItem]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sellerSubmissions = Map.empty<Nat, SellerProductSubmission>();

  // Product Management (Admin only)
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let productId = nextProductId;
    nextProductId += 1;
    let newProduct = {
      product with id = productId;
    };
    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(product.id)) {
      Runtime.trap("Product not found");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func removeProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    products.remove(productId);
  };

  public query ({ caller }) func getProduct(productId : Nat) : async Product {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Cart Management
  public shared ({ caller }) func addToCart(item : CartItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    let updatedCart = currentCart.concat([item]);
    carts.add(caller, updatedCart);
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
    let updatedCart = currentCart.filter(
      func(item) {
        item.productId != productId;
      }
    );
    carts.add(caller, updatedCart);
  };

  public query ({ caller }) func getCart() : async [CartItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (carts.get(caller)) {
      case (null) { [] };
      case (?items) { items };
    };
  };

  // Order Management
  public shared ({ caller }) func createOrder(address : Text, items : [CartItem], total : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let orderId = nextOrderId;
    nextOrderId += 1;
    let order : Order = {
      id = orderId;
      userId = caller;
      items;
      shippingAddress = address;
      totalAmount = total;
      paymentStatus = "pending";
    };
    orders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = { order with paymentStatus = status };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Users can only view their own orders, admins can view all
        if (order.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().filter(func(order) { order.userId == caller }).toArray();
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Seller Product Submission
  public shared ({ caller }) func submitProductForApproval(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit products for approval");
    };

    let submissionId = nextSubmissionId;
    nextSubmissionId += 1;

    let submission : SellerProductSubmission = {
      product;
      seller = caller;
      approvalStatus = #pending;
    };

    sellerSubmissions.add(submissionId, submission);
    submissionId;
  };

  public query ({ caller }) func getSellerSubmissions(seller : Principal) : async [SellerProductSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view submissions");
    };

    if (caller != seller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own submissions");
    };

    sellerSubmissions.values().filter(func(submission) { submission.seller == seller }).toArray();
  };

  public shared ({ caller }) func approveProductSubmission(submissionId : Nat, approvalStatus : ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve submissions");
    };

    switch (sellerSubmissions.get(submissionId)) {
      case (null) { Runtime.trap("Submission not found") };
      case (?submission) {
        // Update submission approval status
        let updatedSubmission = {
          submission with approvalStatus
        };
        sellerSubmissions.add(submissionId, updatedSubmission);

        // Only add to products if approved
        if (approvalStatus == #approved) {
          let productId = nextProductId;
          nextProductId += 1;
          let newProduct = {
            updatedSubmission.product with
            id = productId;
          };
          products.add(productId, newProduct);
        };
      };
    };
  };

  public query ({ caller }) func getAllProductSubmissions() : async [SellerProductSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all product submissions");
    };
    sellerSubmissions.values().toArray();
  };

  // Stripe Management
  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
