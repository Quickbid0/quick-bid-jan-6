// Camera and AI verification step for AddProduct
import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import { supabase } from '../config/supabaseClient';

interface CaptureStepProps {
  productType: string;
  shotType: string;
  label: string;
  instructions: string;
  mediaType?: 'image' | 'video';
  userId?: string | null;
  productId?: string | null;
  onVerified?: (payload: {
    shotType: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    score: number;
    reasons: string[];
  }) => void;
  onAnyVerification?: (payload: {
    shotType: string;
    status: 'approved' | 'rejected';
    score: number;
    reasons: string[];
  }) => void;
}

export const CaptureStep: React.FC<CaptureStepProps> = ({
  productType,
  shotType,
  label,
  instructions,
  mediaType = 'image',
  userId,
  productId,
  onVerified,
  onAnyVerification,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'capturing' | 'uploading' | 'verifying' | 'approved' | 'rejected'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ suggestion?: string; reasons?: string[] }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (e) {
      console.error('Camera error', e);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    try {
      setStatus('capturing');
      setError(null);

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) return reject(new Error('Failed to capture image'));
          resolve(b);
        }, 'image/jpeg', 0.9);
      });

      const tempUrl = URL.createObjectURL(blob);
      setPreviewUrl(tempUrl);

      setStatus('uploading');
      const fileName = `${Date.now()}_${shotType}.jpg`;
      const path = `verification/${userId || 'anonymous'}/${fileName}`;
      const { data, error: uploadError } = await supabase.storage
        .from('verification-media')
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error', uploadError);
        throw new Error('Upload failed');
      }

      const { data: publicUrlData } = supabase.storage.from('verification-media').getPublicUrl(data?.path || path);
      const mediaUrl = publicUrlData.publicUrl;

      setStatus('verifying');
      const result = await aiService.verifyMedia({
        mediaUrl,
        mediaType: 'image',
        productType,
        shotType,
      });

      setFeedback({ suggestion: result.suggestion, reasons: result.reasons });

      const supabaseStatus = result.ok ? 'approved' : 'rejected';
      onAnyVerification?.({
        shotType,
        status: supabaseStatus,
        score: result.score,
        reasons: result.reasons || [],
      });
      try {
        await supabase.from('product_verifications').insert({
          product_id: productId || null,
          user_id: userId || null,
          shot_type: shotType,
          media_url: mediaUrl,
          media_type: 'image',
          status: supabaseStatus,
          score: result.score,
          reasons: result.reasons || [],
        });
      } catch (e) {
        console.warn('Failed to persist verification row', e);
      }

      if (result.ok) {
        setStatus('approved');
        onVerified?.({ shotType, mediaUrl, mediaType: 'image', score: result.score, reasons: result.reasons || [] });
      } else {
        setStatus('rejected');
      }
    } catch (e: any) {
      console.error('Capture/verify error', e);
      setError(e?.message || 'Something went wrong while verifying.');
      setStatus('idle');
    }
  };

  const canCapture = !!stream && status !== 'uploading' && status !== 'verifying';

  return (
    <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{instructions}</p>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
          AI verification
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
                Camera preview will appear here
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!stream ? (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Enable camera
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  disabled={!canCapture}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {status === 'capturing' || status === 'uploading' || status === 'verifying'
                    ? 'Processing...'
                    : 'Capture & verify photo'}
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50"
                >
                  Stop camera
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {previewUrl && (
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Last captured preview</p>
              <img
                src={previewUrl}
                alt={label}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-cover max-h-52"
              />
            </div>
          )}

          <div className="text-xs space-y-1">
            {status === 'approved' && (
              <div className="px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
                Verified. This shot meets our quality guidelines.
                {feedback.suggestion && (
                  <div className="mt-1 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                    AI note: {feedback.suggestion}
                  </div>
                )}
              </div>
            )}

            {status === 'rejected' && (
              <div className="px-3 py-2 rounded-md bg-red-50 text-red-800 dark:bg-red-900/40 dark:text-red-100 space-y-1">
                <div className="font-medium">We couldnt approve this capture.</div>
                {feedback.reasons && feedback.reasons.length > 0 && (
                  <ul className="list-disc list-inside text-[11px]">
                    {feedback.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                )}
                {feedback.suggestion && (
                  <div className="text-[11px]">Tip: {feedback.suggestion}</div>
                )}
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="mt-2 inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Retake & verify again
                </button>
              </div>
            )}

            {status === 'idle' && (
              <div className="text-gray-500 dark:text-gray-400">
                Capture a clear photo following the guide. Our AI will quickly check if it matches the required shot.
              </div>
            )}

            {(status === 'uploading' || status === 'verifying') && (
              <div className="text-indigo-600 dark:text-indigo-300">
                Uploading and verifyingplease wait a moment...
              </div>
            )}

            {error && (
              <div className="text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
