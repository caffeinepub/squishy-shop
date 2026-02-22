import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart, useGetAllProducts, useCreateOrder } from '../hooks/useQueries';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import StripeSetup from '../components/StripeSetup';

export default function Checkout() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetAllProducts();
  const createOrder = useCreateOrder();
  const createCheckoutSession = useCreateCheckoutSession();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  const cartWithProducts = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const total = cartWithProducts.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + Number(item.product.price) * Number(item.quantity);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please login to checkout');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Create order
      const orderId = await createOrder.mutateAsync({
        address: `${formData.name}\n${formData.email}\n${formData.phone}\n${formData.address}`,
        items: cart,
        total: BigInt(total),
      });

      // Create Stripe checkout session
      const shoppingItems = cartWithProducts
        .filter((item) => item.product)
        .map((item) => ({
          productName: item.product!.name,
          productDescription: item.product!.description,
          priceInCents: item.product!.price,
          quantity: item.quantity,
          currency: 'usd',
        }));

      const session = await createCheckoutSession.mutateAsync(shoppingItems);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe
      window.location.href = session.url;
    } catch (error: any) {
      toast.error('Checkout failed', {
        description: error.message || 'Please try again.',
      });
    }
  };

  if (!identity) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-3xl font-black mb-4">Please Login</h2>
        <p className="text-xl text-muted-foreground mb-8">
          You need to login to checkout.
        </p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-3xl font-black mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate({ to: '/' })}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <StripeSetup />

      <div className="text-center">
        <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
          Checkout
        </h1>
        <p className="text-xl text-muted-foreground">Complete your order</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card className="border-2 border-pink-200 dark:border-pink-800">
          <CardHeader>
            <CardTitle className="text-2xl font-black">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-bold"
                disabled={createOrder.isPending || createCheckoutSession.isPending}
              >
                {createOrder.isPending || createCheckoutSession.isPending
                  ? 'Processing...'
                  : 'Continue to Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card className="border-2 border-pink-200 dark:border-pink-800">
            <CardHeader>
              <CardTitle className="text-2xl font-black">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartWithProducts.map((item) => {
                if (!item.product) return null;
                return (
                  <div key={Number(item.productId)} className="flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border-2 border-pink-200 dark:border-pink-800"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {Number(item.quantity)}</p>
                    </div>
                    <p className="font-bold">
                      ${((Number(item.product.price) * Number(item.quantity)) / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}

              <div className="border-t-2 border-pink-200 dark:border-pink-800 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Subtotal:</span>
                  <span className="font-bold">${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Shipping:</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-2xl">
                  <span className="font-black">Total:</span>
                  <span className="font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    ${(total / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
