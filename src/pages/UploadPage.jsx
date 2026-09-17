import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiCamera,
  FiRefreshCw,
  FiScissors,
} from "react-icons/fi";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import ImageUploader from "../components/ImageUploader";
import CameraCapture from "../components/CameraCapture";
import { useMagazine } from "../context/MagazineContext";
import { removeBackground } from "../services/removeBg";
import { fileToDataURL, getAspectRatio } from "../utils/image";
import { COVER_RATIO, ROUTES } from "../utils/constants";
import {
  BG_REMOVAL_ENABLED,
  CAMERA_ENABLED,
  FILE_UPLOAD_ENABLED,
  TEXT_ENABLED,
  ATTRACT_HEADING,
  ATTRACT_BODY,
} from "../config";

export default function UploadPage() {
  const navigate = useNavigate();
  const { name, setName, setUpload, setPerson, original, file } = useMagazine();
  const [busy, setBusy] = useState(false);

  const [started, setStarted] = useState(false);
  const [showCamera, setShowCamera] = useState(
    CAMERA_ENABLED && !FILE_UPLOAD_ENABLED,
  );


  const endSession = () => {
    setUpload(null, null);
    setStarted(false);
    setShowCamera(CAMERA_ENABLED && !FILE_UPLOAD_ENABLED);
  };

  const onSelect = async (picked) => {
    try {
      const dataUrl = await fileToDataURL(picked);
      setUpload(picked, dataUrl);
    } catch (err) {
      toast.error(err.message);
    }
  };


  const onCaptured = async (file, err) => {
    if (!file) {
      toast.error(err?.message || "Could not take the photo.");
      return;
    }
    setShowCamera(false);
    await onSelect(file);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file || !original) return toast.error("Please add a photo first.");
    if (TEXT_ENABLED && !name.trim())
      return toast.error("Please enter the cover name.");

    setBusy(true);
    const t = toast.loading(
      BG_REMOVAL_ENABLED ? "Removing background…" : "Preparing photo…",
    );
    try {
      const { dataUrl, processed } = await removeBackground(file);
      const aspect = await getAspectRatio(dataUrl);
      setPerson(dataUrl, aspect, processed);
      toast.dismiss(t);
      toast.success(processed ? "Background removed!" : "Photo ready!");
      navigate(ROUTES.editor);
    } catch (err) {
      toast.dismiss(t);
      toast.error(err.message || "Could not prepare the photo.");
    } finally {
      setBusy(false);
    }
  };

  const hasImage = Boolean(original?.dataUrl);


  if (CAMERA_ENABLED && !started) {

    return (
      <div className="reveal-head mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <span
          className="mb-[3vmin] flex aspect-square w-[clamp(5rem,14vmin,11rem)]
            items-center justify-center rounded-full bg-clay/10 text-clay"
        >
          <FiCamera className="h-[45%] w-[45%]" />
        </span>

        <h2 className="font-display text-[clamp(2rem,7vmin,4.5rem)] leading-tight font-bold text-ink">
          {ATTRACT_HEADING}
        </h2>
        <p className="mt-[1.5vmin] max-w-[22ch] text-[clamp(1rem,2.6vmin,1.9rem)] text-ink-soft">
          {ATTRACT_BODY}
        </p>

        <Button
          size="lg"
          className="mt-[5vmin] w-full max-w-sm py-[2.2vmin]
            text-[clamp(1.1rem,3vmin,2rem)] shadow-lift"
          onClick={() => setStarted(true)}
        >
          <FiCamera className="h-[1.2em] w-[1.2em]" /> Start
        </Button>

        <p className="mt-[3vmin] text-[clamp(0.7rem,1.5vmin,1.1rem)] text-ink-muted">
          The camera turns on only while you are using this screen.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5 text-center">
        <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
          Create your cover
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          {BG_REMOVAL_ENABLED
            ? `Add a photo${TEXT_ENABLED ? " and a name" : ""} — we’ll cut out the subject and drop it onto the magazine.`
            : `Add a photo${TEXT_ENABLED ? " and a name" : ""} — we’ll drop it onto the magazine for you to position.`}
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        {!hasImage && showCamera ? (
          <CameraCapture
            onCapture={onCaptured}

            onCancel={
              FILE_UPLOAD_ENABLED ? () => setShowCamera(false) : endSession
            }
          />
        ) : !hasImage ? (
          <ImageUploader
            onSelect={onSelect}
            onUseCamera={() => setShowCamera(true)}
          />
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div
              className="relative mx-auto w-full overflow-hidden rounded-2xl
                border border-line bg-ink shadow-lift"
              style={{ aspectRatio: COVER_RATIO }}
            >
              <img
                src={original.dataUrl}
                alt="Selected preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setUpload(null, null);
                  if (CAMERA_ENABLED && !FILE_UPLOAD_ENABLED)
                    setShowCamera(true);
                }}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-lg
                  bg-ink/70 px-2.5 py-1.5 text-xs font-medium text-paper
                  backdrop-blur hover:bg-ink"
              >
                <FiRefreshCw size={13} /> Replace
              </button>
            </div>

            {TEXT_ENABLED && (
              <div>
                <label
                  htmlFor="cover-name"
                  className="mb-1.5 block text-sm font-semibold text-ink"
                >
                  Cover name
                </label>
                <input
                  id="cover-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  maxLength={40}
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3
                    text-ink placeholder:text-ink-muted focus:border-clay
                    focus:outline-none focus:ring-2 focus:ring-clay/40"
                />
                <p className="mt-1 text-xs text-ink-muted">
                  Shown as the headline over your photo.
                </p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Spinner size={18} /> Processing…
                </>
              ) : BG_REMOVAL_ENABLED ? (
                <>
                  <FiScissors size={18} /> Continue
                  <FiArrowRight size={18} />
                </>
              ) : (
                <>
                  Continue to editor <FiArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
