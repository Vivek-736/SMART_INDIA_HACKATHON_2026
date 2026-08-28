import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Medical document uploader supporting PDFs and Images
  medicalDocumentUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await currentUser();
      if (!user) {
        // In kiosk mode or testing, allow with anonymous/kiosk fallback
        return { userId: "kiosk-patient" };
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = (file as { ufsUrl?: string; url?: string }).ufsUrl || file.url;
      return {
        uploadedBy: metadata.userId,
        url: fileUrl,
        name: file.name,
        key: file.key,
        size: file.size,
        type: file.type,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
