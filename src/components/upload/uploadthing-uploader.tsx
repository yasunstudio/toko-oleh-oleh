import { UploadButton, UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";

interface UploadThingImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  endpoint?: keyof OurFileRouter;
}

export function UploadThingImageUploader({
  onUploadComplete,
  onUploadError,
  maxFiles = 4,
  endpoint = "imageUploader"
}: UploadThingImageUploaderProps) {
  return (
    <div className="w-full">
      <UploadDropzone<OurFileRouter, keyof OurFileRouter>
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          console.log("UploadThing upload complete:", res);
          try {
            const urls = res?.map(file => file.url) || [];
            console.log("Extracted URLs:", urls);
            onUploadComplete(urls);
            toast({
              title: "Upload berhasil!",
              description: `${urls.length} gambar berhasil diupload`,
            });
          } catch (err) {
            console.error("Error processing upload result:", err);
            toast({
              title: "Upload gagal",
              description: "Gagal memproses hasil upload",
              variant: "destructive",
            });
          }
        }}
        onUploadError={(error: Error) => {
          console.error("UploadThing upload error:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          onUploadError?.(error);
          toast({
            title: "Upload gagal",
            description: error.message || "Terjadi kesalahan saat upload",
            variant: "destructive",
          });
        }}
        config={{ 
          mode: "auto",
          appendOnPaste: true,
          cn: undefined
        }}
        appearance={{
          container: "w-full border-2 border-dashed border-gray-300 rounded-lg p-8",
          uploadIcon: "w-12 h-12 text-gray-400",
          label: "text-gray-600 text-lg font-medium",
          allowedContent: "text-gray-500 text-sm",
          button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        }}
        content={{
          label: "Pilih gambar atau drag & drop di sini",
          allowedContent: `Maksimal ${maxFiles} file (4MB per file)`,
          button: "Pilih File"
        }}
      />
    </div>
  );
}

export function UploadThingButton({
  onUploadComplete,
  onUploadError,
  endpoint = "imageUploader"
}: Omit<UploadThingImageUploaderProps, 'maxFiles'>) {
  return (
    <UploadButton<OurFileRouter, keyof OurFileRouter>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        console.log("UploadButton upload complete:", res);
        try {
          const urls = res?.map(file => file.url) || [];
          console.log("Extracted URLs:", urls);
          onUploadComplete(urls);
          toast({
            title: "Upload berhasil!",
            description: `${urls.length} gambar berhasil diupload`,
          });
        } catch (err) {
          console.error("Error processing upload result:", err);
          toast({
            title: "Upload gagal",
            description: "Gagal memproses hasil upload",
            variant: "destructive",
          });
        }
      }}
      onUploadError={(error: Error) => {
        console.error("UploadButton upload error:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        onUploadError?.(error);
        toast({
          title: "Upload gagal",
          description: error.message || "Terjadi kesalahan saat upload",
          variant: "destructive",
        });
      }}
      appearance={{
        button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      }}
      content={{
        button: "Upload Gambar"
      }}
    />
  );
}
