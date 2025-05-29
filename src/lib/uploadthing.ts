import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate environment variables
const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;
const UPLOADTHING_TOKEN = process.env.UPLOADTHING_TOKEN;

console.log("UploadThing Environment Check:", {
  hasSecret: !!UPLOADTHING_SECRET,
  hasAppId: !!UPLOADTHING_APP_ID,
  hasToken: !!UPLOADTHING_TOKEN,
  nodeEnv: process.env.NODE_ENV
});

if (!UPLOADTHING_SECRET || !UPLOADTHING_APP_ID) {
  console.error("❌ UploadThing environment variables missing!");
  console.error("Required: UPLOADTHING_SECRET, UPLOADTHING_APP_ID");
  console.error("Check your .env.local file");
}

const f = createUploadthing({
  errorFormatter: (err: any) => {
    console.error("🚨 UploadThing Error Formatter:", {
      message: err.message,
      code: err.code,
      data: err.data,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      cause: err.cause,
      timestamp: new Date().toISOString()
    });
    
    // Return simplified error for client
    return {
      message: err.message || "Upload failed. Please try again.",
      code: err.code || "UPLOAD_ERROR"
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
    .middleware(async ({ req }) => {
      console.log("🔍 UploadThing Middleware Starting...");
      
      try {
        // Get session
        const session = await getServerSession(authOptions);
        
        console.log("Session Check:", {
          hasSession: !!session,
          userId: session?.user?.id,
          userRole: session?.user?.role
        });

        // Check if user is authenticated
        if (!session?.user?.id) {
          console.error("❌ Upload failed: No authenticated user");
          throw new Error("Authentication required");
        }
        
        // Check if user is admin (only for imageUploader)
        if (session.user.role !== 'ADMIN') {
          console.error("❌ Upload failed: Admin access required");
          throw new Error("Admin access required");
        }

        console.log("✅ Upload middleware passed - User authorized");
        return { 
          userId: session.user.id,
          userRole: session.user.role 
        };
        
      } catch (error) {
        console.error("❌ Upload middleware error:", error);
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
        console.log("=== TEST UPLOAD MIDDLEWARE START ===");
        console.log("Test upload middleware triggered");
        console.log("Request headers:", {
          origin: req.headers.get("origin"),
          referer: req.headers.get("referer"),
          userAgent: req.headers.get("user-agent")
        });
        console.log("=== TEST UPLOAD MIDDLEWARE END ===");
        return { userId: "test-user", userRole: "test" };
      } catch (error) {
        console.error("=== TEST UPLOAD MIDDLEWARE ERROR ===");
        console.error("Test upload middleware error:", error);
        console.error("=== TEST UPLOAD MIDDLEWARE ERROR END ===");
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
