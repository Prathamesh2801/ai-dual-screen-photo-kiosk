import axios from "axios";
import { IMAGE_API_URL, UPLOAD_TIMEOUT_MS } from "../config";
import { toReachableUrl } from "./apiOrigin";




export async function uploadCoverImage(blob, opts = {}) {
  const { filename = "cover.png", onProgress, signal } = opts;

  if (!blob) throw new Error("Nothing to upload.");

  const formData = new FormData();
  formData.append("file", blob, filename);

  let response;
  try {
    response = await axios.post(IMAGE_API_URL, formData, {
      validateStatus: () => true,
      timeout: UPLOAD_TIMEOUT_MS,
      signal,
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
        }
      },
    });
  } catch (err) {
    if (err?.code === "ECONNABORTED") {
      throw new Error("Upload timed out.", { cause: err });
    }
    throw new Error(err?.message || "Could not reach the image server.", {
      cause: err,
    });
  }

  const data = response.data;
  const ok =
    response.status >= 200 &&
    response.status < 300 &&
    String(data?.Status).toLowerCase() === "true";

  if (!ok) {
    throw new Error(
      data?.Message || `Upload failed (HTTP ${response.status}).`
    );
  }

  return {
    message: data.Message || "File uploaded.",
    imagePath: toReachableUrl(data.Image_Path),
    downloadUrl: toReachableUrl(data.Download_Image),
  };
}
