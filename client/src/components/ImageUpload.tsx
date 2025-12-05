import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image", accept = "image/jpeg,image/png,image/webp,image/gif" }: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded"
            className="h-32 w-32 rounded-md object-cover border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            data-testid="button-remove-image"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex flex-col items-center justify-center h-32 w-32 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
          data-testid="button-upload-image"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
              <span className="mt-2 text-xs text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground/50" />
              <span className="mt-2 text-xs text-muted-foreground">{label}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface MultiImageUploadProps {
  value?: string[] | null;
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({ value = [], onChange, maxImages = 5, label = "Add Images" }: MultiImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = value || [];
  const canAddMore = images.length < maxImages;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is over 5MB and was skipped`,
          variant: "destructive",
        });
        continue;
      }
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) continue;
        
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          newUrls.push(data.url);
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast({
            title: "Upload failed",
            description: errorData.message || `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast({
          title: "Images uploaded",
          description: `${newUrls.length} image(s) uploaded successfully.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload some images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-multi-file-upload"
      />
      
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="h-24 w-24 rounded-md object-cover border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => handleRemove(index)}
              data-testid={`button-remove-image-${index}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center h-24 w-24 rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
            data-testid="button-add-image"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-muted-foreground/50 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground/50" />
                <span className="mt-1 text-xs text-muted-foreground">{label}</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {images.length} of {maxImages} images. JPEG, PNG, WebP, or GIF. Max 5MB each.
      </p>
    </div>
  );
}
