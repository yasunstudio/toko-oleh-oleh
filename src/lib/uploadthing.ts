import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate environment variables
const UPLOADTHING_SECRET = process.env.UPLOADTHING_SECRET;
const UPLOADTHING_APP_ID = process.env.UPLOADTHING_APP_ID;

if (!UPLOADTHING_SECRET || !UPLOADTHING_APP_ID) {
  console.error("UploadThing environment variables missing:", {
    hasSecret: !!UPLOADTHING_SECRET,
    hasAppId: !!UPLOADTHING_APP_ID,
    nodeEnv: process.env.NODE_ENV
  });
}

const f = createUploadthing({
  errorFormatter: (err) => {
    console.error("UploadThing Server Error:", {
      message: err.message,
      code: err.code,
      data: err.data,
      stack: err.stack,
      cause: err.cause
    });
    
    // Return more detailed error information
    return {
      message: err.message || "Upload failed on server",
      code: err.code || "UNKNOWN_ERROR",
      data: {
        ...err.data,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
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
        console.log("=== UPLOAD MIDDLEWARE START ===");
        console.log("Request headers:", {
          authorization: req.headers.get("authorization") ? "Present" : "Missing",
          cookie: req.headers.get("cookie") ? "Present" : "Missing",
          origin: req.headers.get("origin"),
          referer: req.headers.get("referer")
        });
        
        // This code runs on your server before upload
        const session = await getServerSession(authOptions);
        
        console.log("Upload middleware - Session check:", {
          hasSession: !!session,
          userRole: session?.user?.role,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });

        // If you throw, the user will not be able to upload
        if (!session) {
          console.error("Upload unauthorized: No session found");
          const error = new Error("Unauthorized - Please login first");
          (error as any).code = "UNAUTHORIZED";
          throw error;
        }
        
        if (session.user.role !== 'ADMIN') {
          console.error("Upload forbidden: User is not admin", {
            userRole: session.user.role,
            userId: session.user.id
          });
          const error = new Error("Unauthorized - Admin access required");
          (error as any).code = "FORBIDDEN";
          throw error;
        }

        console.log("Upload middleware - Authorization successful");
        console.log("=== UPLOAD MIDDLEWARE END ===");
        
        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { userId: session.user.id, userRole: session.user.role };
      } catch (error) {
        console.error("=== UPLOAD MIDDLEWARE ERROR ===");
        console.error("Middleware error details:", {
          message: (error as Error).message,
          stack: (error as Error).stack,
          name: (error as Error).name
        });
        console.error("=== UPLOAD MIDDLEWARE ERROR END ===");
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
