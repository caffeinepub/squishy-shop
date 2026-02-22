import { useState } from 'react';
import { useGetAllProducts } from '../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

export default function ProductCatalog() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const [filter, setFilter] = useState<'all' | 'Paper Squishies' | 'Slime'>('all');

  const filteredProducts = products.filter((product) => {
    if (filter === 'all') return true;
    return product.name.toLowerCase().includes(filter.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-64 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Our Amazing Collection
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the squishiest squishies and the slimiest slime you've ever seen!
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="font-bold rounded-full"
        >
          All Products
        </Button>
        <Button
          variant={filter === 'Paper Squishies' ? 'default' : 'outline'}
          onClick={() => setFilter('Paper Squishies')}
          className="font-bold rounded-full"
        >
          Paper Squishies
        </Button>
        <Button
          variant={filter === 'Slime' ? 'default' : 'outline'}
          onClick={() => setFilter('Slime')}
          className="font-bold rounded-full"
        >
          Slime
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={Number(product.id)}
            to="/products/$productId"
            params={{ productId: product.id.toString() }}
          >
            <Card className="h-full hover:shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-transparent hover:border-pink-300 dark:hover:border-pink-700 cursor-pointer overflow-hidden group">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm px-3 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-2xl font-black mb-2 text-gray-800 dark:text-gray-100">
                  {product.name}
                </CardTitle>
                <p className="text-muted-foreground line-clamp-2 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full font-bold" size="lg">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
