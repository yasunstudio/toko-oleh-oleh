import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate environment variables
const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;

if (!UPLOADTHING_SECRET || !UPLOADTHING_APP_ID) {
  console.warn("UploadThing environment variables not found. Upload functionality may not work properly.");
}

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("UploadThing Error:", {
      message: err.message,
      code: err.code,
      data: err.data,
      stack: err.stack
    });
    return {
      message: err.message || "Upload failed",
      code: err.code || "UNKNOWN_ERROR",
      data: err.data,
    };
  },
});

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 10,
      acl: "public-read"
    } 
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      try {
        // This code runs on your server before upload
        const session = await getServerSession(authOptions);
        
        console.log("Upload middleware - Session check:", {
          hasSession: !!session,
          userRole: session?.user?.role
        });

        // If you throw, the user will not be able to upload
        if (!session) {
          const error = new Error("Unauthorized - Please login first");
          (error as any).code = "UNAUTHORIZED";
          throw error;
        }
        
        if (session.user.role !== 'ADMIN') {
          const error = new Error("Unauthorized - Admin access required");
          (error as any).code = "FORBIDDEN";
          throw error;
        }

        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { userId: session.user.id, userRole: session.user.role };
      } catch (error) {
        console.error("Upload middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File details:", {
          url: file.url,
          key: file.key,
          name: file.name,
          size: file.size
        });

        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { 
          uploadedBy: metadata.userId, 
          url: file.url,
          key: file.key,
          name: file.name
        };
      } catch (error) {
        console.error("Upload completion error:", error);
        throw error;
      }
    }),

  // Test uploader - for debugging purposes (no auth required)
  testUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 3,
      acl: "public-read"
    } 
  })
    .middleware(async ({ req }) => {
      try {
        // No authentication required for testing
        console.log("Test upload middleware triggered");
        return { userId: "test-user", userRole: "test" };
      } catch (error) {
        console.error("Test upload middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        console.log("Test upload complete:", { metadata, file });
        return { 
          uploadedBy: metadata.userId, 
          url: file.url,
          key: file.key,
          name: file.name
        };
      } catch (error) {
        console.error("Test upload completion error:", error);
        throw error;
      }
    }),
  paymentProofUploader: f({ 
    image: { 
      maxFileSize: "4MB", 
      maxFileCount: 1,
      acl: "public-read"
    } 
  })
    .middleware(async ({ req }) => {
      try {
        // This code runs on your server before upload
        const session = await getServerSession(authOptions);
        
        console.log("Payment proof upload middleware - Session check:", {
          hasSession: !!session,
          userId: session?.user?.id
        });

        // If you throw, the user will not be able to upload
        if (!session) {
          console.error("Payment proof upload unauthorized: No session");
          const error = new Error("Unauthorized - Please login first");
          (error as any).code = "UNAUTHORIZED";
          throw error;
        }

        // Allow any authenticated user to upload payment proof
        return { userId: session.user.id, userRole: session.user.role };
      } catch (error) {
        console.error("Payment proof upload middleware error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Payment proof upload complete for userId:", metadata.userId);
        console.log("Payment proof file details:", {
          url: file.url,
          key: file.key,
          name: file.name,
          size: file.size
        });

        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { 
          uploadedBy: metadata.userId, 
          url: file.url,
          key: file.key,
          name: file.name
        };
      } catch (error) {
        console.error("Payment proof upload completion error:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
