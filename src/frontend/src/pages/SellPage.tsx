import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSubmitProductForApproval } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Loader2, Store, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SellPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const submitProduct = useSubmitProductForApproval();

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file must be less than 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to submit a product');
      return;
    }

    if (!productName || !description || !price || !category || !imageFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceInCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      // Convert image to base64 data URL for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;

        // Prepare product data
        const productData = {
          id: BigInt(0), // Will be assigned by backend
          name: productName,
          description,
          price: BigInt(priceInCents),
          images: [imageDataUrl],
          variants: [category],
        };

        try {
          // Submit to backend
          await submitProduct.mutateAsync(productData);

          toast.success('Product submitted for approval!', {
            description: 'Your product will be reviewed by our team.',
          });

          // Clear form
          setProductName('');
          setDescription('');
          setPrice('');
          setCategory('');
          setImageFile(null);
          setImagePreview(null);
        } catch (error: any) {
          console.error('Error submitting product:', error);
          toast.error('Failed to submit product', {
            description: error.message || 'Please try again later',
          });
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read image file');
      };

      reader.readAsDataURL(imageFile);
    } catch (error: any) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image', {
        description: error.message || 'Please try again',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert className="border-pink-300 bg-pink-50 dark:bg-pink-950/20">
          <AlertCircle className="h-4 w-4 text-pink-600" />
          <AlertDescription className="text-pink-800 dark:text-pink-200">
            Please log in to submit products for sale.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-4 border-purple-300 dark:border-purple-700 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 dark:from-pink-950 dark:via-purple-950 dark:to-blue-950">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-3 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                List Your Product
              </CardTitle>
              <CardDescription className="text-base font-medium">
                Submit your squishies or slime for approval
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName" className="text-lg font-bold">
                Product Name *
              </Label>
              <Input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Rainbow Dino Squishy"
                required
                className="border-2 border-purple-300 focus:border-purple-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-bold">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                rows={4}
                required
                className="border-2 border-purple-300 focus:border-purple-500"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-lg font-bold">
                Price (USD) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                required
                className="border-2 border-purple-300 focus:border-purple-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lg font-bold">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="border-2 border-purple-300 focus:border-purple-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paper Squishies">Paper Squishies</SelectItem>
                  <SelectItem value="Slime">Slime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-lg font-bold">
                Product Image *
              </Label>
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <label htmlFor="image" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <p className="text-sm text-muted-foreground">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-purple-400" />
                      <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                        Click to upload image
                      </p>
                      <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitProduct.isPending}
                className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold text-lg py-6 shadow-lg"
              >
                {submitProduct.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Approval'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
                className="border-2 border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
