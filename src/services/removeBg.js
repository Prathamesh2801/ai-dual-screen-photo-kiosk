import axios from "axios";
import { BG_REMOVAL_ENABLED, BG_REMOVER_URL } from "../config";
import { blobToDataURL, fileToDataURL } from "../utils/image";




export async function bgRemover(image) {
  const formData = new FormData();
  formData.append("image", image);

  const response = await axios.post(BG_REMOVER_URL, formData, {
    responseType: "blob",
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    let message = `Background removal failed (HTTP ${response.status}).`;
    try {
      const text = await response.data.text();
      if (text) message = text.slice(0, 200);
    } catch {
      // Non-text error body; keep the generic message.
    }
    throw new Error(message);
  }

  return response.data;
}


export async function removeBackground(file) {
  if (!BG_REMOVAL_ENABLED) {
    const dataUrl = await fileToDataURL(file);
    return { dataUrl, processed: false };
  }

  const blob = await bgRemover(file);
  const dataUrl = await blobToDataURL(blob);
  return { dataUrl, processed: true };
}
