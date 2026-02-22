import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import { useGetCart } from '../hooks/useQueries';

export default function CartIcon() {
  const navigate = useNavigate();
  const { data: cart = [] } = useGetCart();

  const itemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={() => navigate({ to: '/cart' })}
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
