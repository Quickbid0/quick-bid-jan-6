import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { createOrLoadUserKey } from '../security/keyring';
import { encryptBytes, toBase64 } from '../security/crypto';
import { 
  Camera, 
  Video, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Palette,
  Hammer,
  Scissors,
  Brush,
  Play,
  Pause,
  RotateCcw,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CreativeWork {
  id: string;
  title: string;
  type: 'painting' | 'sculpture' | 'woodwork' | 'handmade';
  description: string;
  images: string[];
  video_proof: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  ai_analysis: any;
  created_at: string;
}

const CreativeVerification = () => {
  const [works, setWorks] = useState<CreativeWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);

  const [newWork, setNewWork] = useState({
    title: '',
    type: 'painting',
    description: '',
    images: [],
    video_proof: null
  });

  const creativeTypes = [
    { id: 'painting', name: 'Painting', icon: <Palette className="h-6 w-6" />, color: 'bg-purple-500' },
    { id: 'sculpture', name: 'Sculpture', icon: <Hammer className="h-6 w-6" />, color: 'bg-orange-500' },
    { id: 'woodwork', name: 'Woodwork', icon: <Scissors className="h-6 w-6" />, color: 'bg-green-500' },
    { id: 'handmade', name: 'Handmade Crafts', icon: <Brush className="h-6 w-6" />, color: 'bg-blue-500' }
  ];

  useEffect(() => {
    fetchCreativeWorks();
  }, []);

  const fetchCreativeWorks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('creative_works')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error) {
      console.error('Error fetching creative works:', error);
      toast.error('Failed to load creative works');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      toast.error('Failed to start recording. Please check camera permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewWork(prev => ({ ...prev, images: files }));
  };

  const submitCreativeWork = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare user key for client-side encryption
      const dataKey = await createOrLoadUserKey(user.id, user.email);

      // Upload images (client-side encrypted)
      const imageUrls = await Promise.all(
        newWork.images.map(async (file) => {
          const arrayBuf = await file.arrayBuffer();
          const { iv, ciphertext } = await encryptBytes(dataKey, new Uint8Array(arrayBuf));
          const encryptedBlob = new Blob([ciphertext], { type: 'application/octet-stream' });
          const fileName = `${user.id}/${Date.now()}_${file.name}.enc`;
          const { error } = await supabase.storage
            .from('creative-works')
            .upload(fileName, encryptedBlob);
          if (error) throw error;
          const { data } = supabase.storage
            .from('creative-works')
            .getPublicUrl(fileName);
          // Persist iv alongside URL for later decryption
          return `${data.publicUrl}#iv=${toBase64(iv)}`;
        })
      );

      // Upload video proof
      let videoUrl = null;
      if (recordedVideo) {
        const arrayBuf = await recordedVideo.arrayBuffer();
        const { iv, ciphertext } = await encryptBytes(dataKey, new Uint8Array(arrayBuf));
        const encryptedBlob = new Blob([ciphertext], { type: 'application/octet-stream' });
        const videoFileName = `${user.id}/video_${Date.now()}.webm.enc`;
        const { error } = await supabase.storage
          .from('creative-works')
          .upload(videoFileName, encryptedBlob);
        if (error) throw error;
        const { data } = supabase.storage
          .from('creative-works')
          .getPublicUrl(videoFileName);
        videoUrl = `${data.publicUrl}#iv=${toBase64(iv)}`;
      }

      // Submit to AI analysis
      const aiAnalysis = await analyzeCreativeWork(imageUrls, videoUrl);

      // Save to database
      const { error } = await supabase
        .from('creative_works')
        .insert([{
          artist_id: user.id,
          title: newWork.title,
          type: newWork.type,
          description: newWork.description,
          images: imageUrls,
          video_proof: videoUrl,
          ai_analysis: aiAnalysis,
          verification_status: 'pending'
        }]);

      if (error) throw error;

      toast.success('Creative work submitted for verification');
      setShowUploadModal(false);
      setNewWork({ title: '', type: 'painting', description: '', images: [], video_proof: null });
      setRecordedVideo(null);
      fetchCreativeWorks();
    } catch (error) {
      console.error('Error submitting creative work:', error);
      toast.error('Failed to submit creative work');
    }
  };

  const analyzeCreativeWork = async (imageUrls: string[], videoUrl: string) => {
    // Mock AI analysis - in real implementation, this would call AI services
    return {
      authenticity_score: Math.random() * 100,
      style_analysis: {
        technique: 'Oil painting',
        period: 'Contemporary',
        influences: ['Impressionism', 'Modern Art']
      },
      quality_metrics: {
        composition: Math.random() * 100,
        color_harmony: Math.random() * 100,
        technical_skill: Math.random() * 100
      },
      originality_check: {
        is_original: Math.random() > 0.1,
        similarity_matches: []
      }
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Creative Verification</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify your creative works with AI-powered authenticity checks
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Submit Creative Work
        </button>
      </div>

      {/* Creative Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {creativeTypes.map((type) => (
          <div key={type.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
            <div className={`${type.color} text-white p-3 rounded-lg inline-block mb-3`}>
              {type.icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{type.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {works.filter(w => w.type === type.id).length} works
            </p>
          </div>
        ))}
      </div>

      {/* Creative Works List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="relative">
              <img
                src={work.images[0] || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80'}
                alt={work.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                {getStatusIcon(work.verification_status)}
                <span className="text-xs font-medium capitalize">{work.verification_status}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{work.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {work.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">{work.type}</span>
                {work.ai_analysis && (
                  <span className="text-sm font-medium text-green-600">
                    AI Score: {work.ai_analysis.authenticity_score?.toFixed(0)}%
                  </span>
                )}
              </div>
              
              {work.video_proof && (
                <div className="mt-3">
                  <video
                    src={work.video_proof}
                    className="w-full h-24 object-cover rounded"
                    controls
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">Submit Creative Work</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newWork.title}
                  onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter artwork title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newWork.type}
                  onChange={(e) => setNewWork(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {creativeTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWork.description}
                  onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Describe your creative work"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Proof (Required for Verification)
                </label>
                <div className="space-y-4">
                  {!recordedVideo ? (
                    <div className="text-center">
                      <button
                        onClick={recording ? stopRecording : startRecording}
                        className={`px-6 py-3 rounded-lg flex items-center gap-2 mx-auto ${
                          recording 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {recording ? (
                          <>
                            <Pause className="h-5 w-5" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Video className="h-5 w-5" />
                            Start Recording
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Record yourself creating or explaining your work
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <video
                        src={URL.createObjectURL(recordedVideo)}
                        className="w-full max-w-md mx-auto rounded-lg"
                        controls
                      />
                      <button
                        onClick={() => setRecordedVideo(null)}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mx-auto"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Record Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitCreativeWork}
                disabled={!newWork.title || !newWork.description || !recordedVideo}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeVerification;