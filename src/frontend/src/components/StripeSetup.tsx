import { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration, useIsCallerAdmin } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const { data: isAdmin } = useIsCallerAdmin();
  const setStripeConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const showSetup = !isLoading && !isConfigured && isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setStripeConfig.mutateAsync({
        secretKey,
        allowedCountries: countries.split(',').map((c) => c.trim()),
      });
      toast.success('Stripe configured successfully!');
    } catch (error: any) {
      toast.error('Failed to configure Stripe', {
        description: error.message || 'Please try again.',
      });
    }
  };

  if (!showSetup) return null;

  return (
    <Dialog open={showSetup}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Configure Stripe Payment</DialogTitle>
          <DialogDescription>
            Please configure Stripe to enable payment processing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="US,CA,GB"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold"
            disabled={setStripeConfig.isPending}
          >
            {setStripeConfig.isPending ? 'Configuring...' : 'Configure Stripe'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
