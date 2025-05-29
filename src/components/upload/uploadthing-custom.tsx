"use client";

import { useUploadThing } from "@/lib/uploadthing-client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface CustomUploadThingProps {
  onUploadComplete: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  endpoint?: "imageUploader" | "paymentProofUploader" | "testUploader";
}

export function CustomUploadThing({
  onUploadComplete,
  onUploadError,
  maxFiles = 4,
  endpoint = "imageUploader"
}: CustomUploadThingProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading: uploadThingLoading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      console.log("Custom UploadThing upload complete:", res);
      try {
        const urls = res?.map(file => file.url) || [];
        console.log("Extracted URLs:", urls);
        onUploadComplete(urls);
        setFiles([]);
        setIsUploading(false);
        toast({
          title: "Upload berhasil!",
          description: `${urls.length} gambar berhasil diupload`,
        });
      } catch (err) {
        console.error("Error processing upload result:", err);
        setIsUploading(false);
        toast({
          title: "Upload gagal",
          description: "Gagal memproses hasil upload",
          variant: "destructive",
        });
      }
    },
    onUploadError: (error) => {
      console.error("Custom UploadThing upload error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: (error as any).cause,
        code: (error as any).code,
        data: (error as any).data
      });
      
      setIsUploading(false);
      onUploadError?.(error);
      
      // Enhanced error messages for common issues
      let errorMessage = "Terjadi kesalahan saat upload";
      let debugInfo = "";
      
      if (error.message?.includes("Unauthorized") || error.message?.includes("UNAUTHORIZED")) {
        errorMessage = "Anda harus login sebagai admin untuk mengupload gambar";
      } else if (error.message?.includes("FORBIDDEN")) {
        errorMessage = "Akses ditolak. Hanya admin yang dapat mengupload gambar";
      } else if (error.message?.includes("CORS")) {
        errorMessage = "Masalah koneksi CORS. Periksa konfigurasi server";
        debugInfo = "CORS error - check server configuration";
      } else if (error.message?.includes("Network") || error.message?.includes("fetch")) {
        errorMessage = "Masalah jaringan. Periksa koneksi internet Anda";
        debugInfo = "Network connectivity issue";
      } else if (error.message?.includes("Something went wrong")) {
        errorMessage = "Terjadi kesalahan pada server UploadThing";
        debugInfo = `UploadThing server error - ${error.name}`;
      } else if (error.name === "UploadThingError") {
        errorMessage = "Error dari layanan UploadThing. Silakan coba lagi";
        debugInfo = `UploadThingError: ${error.message}`;
      } else {
        errorMessage = error.message || "Error tidak diketahui";
        debugInfo = `Unknown error: ${error.name || 'N/A'}`;
      }
      
      console.error("Upload error debug info:", debugInfo);
      
      toast({
        title: "Upload gagal",
        description: errorMessage,
        variant: "destructive",
      });
    },
    onUploadBegin: (name) => {
      console.log("Upload begin for file:", name);
    },
    onUploadProgress: (progress) => {
      console.log("Upload progress:", progress);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length > maxFiles) {
      toast({
        title: "Terlalu banyak file",
        description: `Maksimal ${maxFiles} file yang diizinkan`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "File tidak valid",
          description: `${file.name} bukan file gambar`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > 4 * 1024 * 1024) { // 4MB
        toast({
          title: "File terlalu besar",
          description: `${file.name} lebih dari 4MB`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    console.log("Starting upload for files:", files.map(f => f.name));
    
    try {
      await startUpload(files);
    } catch (error) {
      console.error("Upload initiation error:", error);
      setIsUploading(false);
      toast({
        title: "Upload gagal",
        description: "Gagal memulai upload",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isLoading = isUploading || uploadThingLoading;

  return (
    <div className="w-full space-y-4">
      {/* File Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Pilih Gambar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Maksimal {maxFiles} file (4MB per file)
        </p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">File yang dipilih:</h4>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isLoading || files.length === 0}
            className="w-full"
          >
            {isLoading ? "Mengupload..." : `Upload ${files.length} Gambar`}
          </Button>
        </div>
      )}
    </div>
  );
}
