import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <Card className="border-4 border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-red-400 to-orange-400 p-6 rounded-full">
              <XCircle className="w-24 h-24 text-white" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">
              Unfortunately, your payment could not be processed.
            </p>
            <p className="text-lg text-muted-foreground">
              Please check your payment details and try again, or contact support if the problem persists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/cart' })}
              className="font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
            <Button size="lg" onClick={() => navigate({ to: '/checkout' })} className="font-bold">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
