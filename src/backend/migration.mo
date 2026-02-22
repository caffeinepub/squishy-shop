import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  // Types for migration
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    images : [Text];
    variants : [Text];
  };

  type ApprovalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type SellerProductSubmission = {
    product : Product;
    seller : Principal;
    approvalStatus : ApprovalStatus;
  };

  type OldActor = {
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    carts : Map.Map<Principal, [CartItem]>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : Nat;
    nextOrderId : Nat;
    stripeConfig : ?StripeConfiguration;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
    variant : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type Order = {
    id : Nat;
    userId : Principal;
    items : [CartItem];
    shippingAddress : Text;
    totalAmount : Nat;
    paymentStatus : Text;
  };

  type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    carts : Map.Map<Principal, [CartItem]>;
    userProfiles : Map.Map<Principal, UserProfile>;
    sellerSubmissions : Map.Map<Nat, SellerProductSubmission>;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextSubmissionId : Nat;
    stripeConfig : ?StripeConfiguration;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      sellerSubmissions = Map.empty<Nat, SellerProductSubmission>();
      nextSubmissionId = 1;
    };
  };
};
