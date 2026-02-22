import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ProductDetail() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(Number(productId));
  const addToCart = useAddToCart();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!product) return;

    const variant = selectedVariant || (product.variants.length > 0 ? product.variants[0] : 'default');

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
        variant,
      });
      toast.success('Added to cart!', {
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast.error('Failed to add to cart', {
        description: error.message || 'Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-black mb-4">Product not found</h2>
        <Button onClick={() => navigate({ to: '/' })}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-8 font-bold"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-4 border-pink-200 dark:border-pink-800">
            <CardContent className="p-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
                <Card key={index} className="overflow-hidden border-2 border-pink-200 dark:border-pink-800">
                  <CardContent className="p-0">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-24 object-cover"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Popular
            </Badge>
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              {product.name}
            </h1>
            <p className="text-5xl font-black text-gray-800 dark:text-gray-100 mb-6">
              ${(Number(product.price) / 100).toFixed(2)}
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-bold">Select Variant</label>
              <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={product.variants[0]} />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant} value={variant}>
                      {variant}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold">Quantity</label>
            <Select value={quantity.toString()} onValueChange={(v) => setQuantity(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            className="w-full font-bold text-lg"
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
