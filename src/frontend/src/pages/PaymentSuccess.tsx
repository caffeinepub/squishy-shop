import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear cart cache after successful payment
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  }, [queryClient]);

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <Card className="border-4 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-green-400 to-blue-400 p-6 rounded-full">
              <CheckCircle className="w-24 h-24 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase! Your order has been confirmed.
            </p>
            <p className="text-lg text-muted-foreground">
              We'll send you an email confirmation shortly with your order details.
            </p>
            <div className="flex items-center justify-center gap-2 text-pink-500 dark:text-pink-400">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Get ready for some squishy fun!</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate({ to: '/' })} className="font-bold">
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
