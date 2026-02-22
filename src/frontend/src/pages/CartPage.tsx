import { useGetCart, useRemoveFromCart, useGetAllProducts } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetAllProducts();
  const removeFromCart = useRemoveFromCart();

  const cartWithProducts = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const total = cartWithProducts.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price) * Number(item.quantity);
  }, 0);

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error('Failed to remove item', {
        description: error.message || 'Please try again.',
      });
    }
  };

  const handleCheckout = () => {
    if (!identity) {
      toast.error('Please login to checkout');
      return;
    }
    navigate({ to: '/checkout' });
  };

  if (!identity) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
        <h2 className="text-3xl font-black mb-4">Please Login</h2>
        <p className="text-xl text-muted-foreground mb-8">
          You need to login to view your shopping cart.
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
        <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Add some squishy goodness to your cart!
        </p>
        <Button size="lg" onClick={() => navigate({ to: '/' })} className="font-bold">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
          Shopping Cart
        </h1>
        <p className="text-xl text-muted-foreground">
          {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="space-y-4">
        {cartWithProducts.map((item) => {
          if (!item.product) return null;

          return (
            <Card key={Number(item.productId)} className="border-2 border-pink-200 dark:border-pink-800">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-pink-200 dark:border-pink-800"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-2">{item.product.name}</h3>
                    {item.variant !== 'default' && (
                      <p className="text-sm text-muted-foreground mb-2">Variant: {item.variant}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-2">
                      Quantity: {Number(item.quantity)}
                    </p>
                    <p className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      ${((Number(item.product.price) * Number(item.quantity)) / 100).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(item.productId)}
                    disabled={removeFromCart.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-4 border-pink-300 dark:border-pink-700 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="text-3xl font-black">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-xl">
            <span className="font-bold">Subtotal:</span>
            <span className="font-black">${(total / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl">
            <span className="font-bold">Shipping:</span>
            <span className="font-black">FREE</span>
          </div>
          <div className="border-t-2 border-pink-300 dark:border-pink-700 pt-4">
            <div className="flex justify-between text-3xl">
              <span className="font-black">Total:</span>
              <span className="font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                ${(total / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full font-bold text-lg" onClick={handleCheckout}>
            Proceed to Checkout
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
