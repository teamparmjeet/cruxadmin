import { uploadToS3 } from "@/lib/s3";

export const POST = async (request) => {
  try {
    const formData = await request.formData();

    const singleFile = formData.get("file");
    const folder = formData.get("folder") || "uploads"; // Default fallback

    if (singleFile) {
      const uploadedSingleFileUrl = await uploadToS3(singleFile, folder);
      return Response.json(
        {
          message: "Single file uploaded successfully!",
          success: true,
          file: uploadedSingleFileUrl,
        },
        { status: 200 }
      );
    }


  
  } catch (error) {
    console.error("Error on file upload:", error);
    return Response.json(
      {
        message: "Error on file upload!",
        success: false,
      },
      { status: 500 }
    );
  }
};
