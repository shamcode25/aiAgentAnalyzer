import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Copy,
  ChevronRight,
  Zap,
  Calendar,
  User,
  Stethoscope,
  CreditCard,
  Upload,
  FileAudio,
} from 'lucide-react';
import { GlowButton } from './components/glow-button';
import { StatusBadge } from './components/status-badge';
import { GlowProgressBar } from './components/glow-progress-bar';
import { GlassCard } from './components/glass-card';
import { ToggleSwitch } from './components/toggle-switch';
import { TabSystem } from './components/tab-system';
import { EditableChip } from './components/editable-chip';
import { DebugPanel } from './components/debug-panel';
import { AIChatAssistant } from './components/ai-chat-assistant';
import { ToastNotification } from './components/toast-notification';
import { LoadingSkeleton } from './components/loading-skeleton';
import { checkHealth, analyze, transcribeAudio, type AnalyzeResponse } from './api';
import { SAMPLES, getSampleById } from './samples';

function urgencyBadgeVariant(urgency: string): 'routine' | 'urgent' | 'emergent' | 'info' {
  const u = urgency?.toLowerCase();
  if (u === 'er') return 'emergent';
  if (u === 'same_day') return 'urgent';
  return 'routine';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('transcript');
  const [debugMode, setDebugMode] = useState(false);
  const [sampleId, setSampleId] = useState(SAMPLES[0]?.id ?? 'scheduling');
  const [transcript, setTranscript] = useState(SAMPLES[0]?.transcript ?? '');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  useEffect(() => {
    const s = getSampleById(sampleId);
    if (s) setTranscript(s.transcript);
  }, [sampleId]);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setToastMessage('Please enter a transcript.');
      setToastType('warning');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    setLoading(true);
    setAnalysis(null);
    setAnalysisComplete(false);
    try {
      const result = await analyze({
        transcript,
        caller_context: null,
        channel: null,
        debug: debugMode,
      });
      setAnalysis(result);
      setAnalysisComplete(true);
      setToastMessage('AI Analysis Complete');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setBackendOnline(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
        setBackendOnline(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setAnalysis(null);
    setAnalysisComplete(false);
    setUploadedFileName(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setToastMessage('Please upload an audio file (mp3, wav, m4a, etc.)');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setTranscribing(true);
    setUploadedFileName(file.name);
    setToastMessage('Transcribing audio...');
    setToastType('success');
    setShowToast(true);

    try {
      const result = await transcribeAudio(file);
      setTranscript(result.transcript);
      setToastMessage('Audio transcribed successfully!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Switch to transcript tab to show the result
      setActiveTab('transcript');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      setUploadedFileName(null);
    } finally {
      setTranscribing(false);
    }
  };

  const copySummary = () => {
    if (!analysis?.documentation?.summary_bullets?.length) return;
    const text = analysis.documentation.summary_bullets.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage('Summary copied');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const tabs = [
    { id: 'transcript', label: 'Transcript' },
    { id: 'audio', label: 'Audio Upload' },
    { id: 'live', label: 'Live Agent Mode' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-gray-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <header className="relative border-b border-white/10 backdrop-blur-xl bg-[#0B1220]/80">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl tracking-tight">Care Navigator Agent</h1>
                  <p className="text-xs text-gray-400 tracking-wider hidden sm:block">
                    AI Clinical Operations Engine
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border ${
                  backendOnline === true
                    ? 'bg-white/5 border-white/10'
                    : backendOnline === false
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-white/5 border-white/10'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    backendOnline === true
                      ? 'bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)] animate-pulse'
                      : backendOnline === false
                        ? 'bg-red-400'
                        : 'bg-gray-400'
                  }`}
                />
                <span className="text-xs text-gray-300">
                  {backendOnline === true
                    ? 'Backend Online'
                    : backendOnline === false
                      ? 'Backend Offline'
                      : 'Checking...'}
                </span>
              </div>
              <StatusBadge variant="info" glow={false}>
                DEV
              </StatusBadge>
            </div>
          </div>
        </div>
        <motion.div
          className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </header>

      <ToastNotification message={toastMessage} type={toastType} visible={showToast} />

      <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg">AI Input Console</h2>
              </div>

              <TabSystem tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

              {activeTab === 'transcript' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Sample Scenario</label>
                    <select
                      value={sampleId}
                      onChange={(e) => setSampleId(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-blue-400/50 transition-colors duration-300"
                    >
                      {SAMPLES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Call Transcript</label>
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 bg-white/5 border border-blue-400/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 resize-none"
                      placeholder="Enter or paste call transcript here..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <ToggleSwitch
                      checked={debugMode}
                      onChange={setDebugMode}
                      label="Debug Mode"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <GlowButton
                      variant="primary"
                      pulse={!analysisComplete}
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          Run AI Analysis
                        </span>
                      )}
                    </GlowButton>
                    <GlowButton variant="secondary" onClick={handleClear}>
                      Clear
                    </GlowButton>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
                      ${
                        dragActive
                          ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                          : 'border-white/20 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'
                      }
                      ${transcribing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                    `}
                    onClick={() => document.getElementById('audio-file-input')?.click()}
                  >
                    <input
                      id="audio-file-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={transcribing}
                    />
                    {transcribing ? (
                      <>
                        <motion.div
                          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <FileAudio className="w-8 h-8 text-blue-400" />
                        </motion.div>
                        <p className="text-gray-300 font-medium">Transcribing audio...</p>
                        <p className="text-sm text-gray-400 mt-1">{uploadedFileName}</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-300 font-medium mb-1">
                          {uploadedFileName ? `Uploaded: ${uploadedFileName}` : 'Drop audio file here'}
                        </p>
                        <p className="text-sm text-gray-400">
                          or <span className="text-blue-400 underline">click to browse</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Supports: MP3, WAV, M4A, OGG, FLAC, and other audio formats
                        </p>
                      </>
                    )}
                  </div>

                  {uploadedFileName && !transcribing && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">{uploadedFileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileName(null);
                          document.getElementById('audio-file-input') && ((document.getElementById('audio-file-input') as HTMLInputElement).value = '');
                        }}
                        className="text-xs text-gray-400 hover:text-gray-300"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {transcript && (
                    <div className="pt-4 border-t border-white/10">
                      <label className="text-sm text-gray-400 mb-2 block">Transcribed Text</label>
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 bg-white/5 border border-blue-400/30 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-400/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 resize-none"
                        placeholder="Transcribed text will appear here..."
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <GlowButton
                      variant="primary"
                      onClick={handleAnalyze}
                      disabled={loading || !transcript.trim()}
                      className="flex-1"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-4 h-4" />
                          Run AI Analysis
                        </span>
                      )}
                    </GlowButton>
                    <GlowButton variant="secondary" onClick={handleClear}>
                      Clear
                    </GlowButton>
                  </div>
                </div>
              )}

              {activeTab === 'live' && (
                <div className="py-12 text-center text-gray-400">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    </div>
                  </div>
                  <p>Live agent mode</p>
                  <p className="text-sm">Real-time call analysis</p>
                </div>
              )}
            </GlassCard>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : analysisComplete && analysis ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg">Intent Intelligence</h3>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border border-blue-400/50 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                          <Sparkles className="w-4 h-4 text-blue-300" />
                          <span className="text-sm uppercase tracking-wider">
                            {analysis.intent.intent}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Confidence Score</span>
                          <span className="text-sm text-blue-300">
                            {Math.round(analysis.intent.confidence * 100)}%
                          </span>
                        </div>
                        <GlowProgressBar
                          value={analysis.intent.confidence}
                          max={1}
                          color="blue"
                          showLabel={false}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-3">{analysis.intent.reason}</p>
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-teal-400" />
                        <h3 className="text-lg">Clinical Triage Engine</h3>
                      </div>
                      <StatusBadge variant={urgencyBadgeVariant(analysis.triage.urgency)}>
                        {analysis.triage.urgency.toUpperCase()}
                      </StatusBadge>
                    </div>
                    <div className="space-y-4">
                      {analysis.triage.red_flags_detected?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {analysis.triage.red_flags_detected.map((f, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs text-red-300"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                          <Stethoscope className="w-4 h-4 text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{analysis.triage.reasoning}</p>
                          {analysis.triage.questions_to_ask?.length > 0 && (
                            <ul className="mt-2 text-sm text-gray-400 list-disc list-inside">
                              {analysis.triage.questions_to_ask.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <GlowButton variant="secondary" className="w-full">
                        <span className="flex items-center justify-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          Escalate to RN (if needed)
                        </span>
                      </GlowButton>
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg">Routing & Entities</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <EditableChip label="Route to" value={analysis.orchestration.route_to} />
                      <EditableChip label="Intent" value={analysis.intent.intent} />
                      <EditableChip label="Urgency" value={analysis.triage.urgency} />
                      {analysis.orchestration.escalation_reason && (
                        <EditableChip
                          label="Escalation"
                          value={analysis.orchestration.escalation_reason}
                        />
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {analysis.orchestration.suggested_script?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <GlassCard>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg">Suggested Script</h3>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {analysis.orchestration.suggested_script.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </GlassCard>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GlassCard>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg">Next Best Actions</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.orchestration.next_best_actions?.map((action, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-blue-400/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300 cursor-default"
                          whileHover={{ x: 4 }}
                        >
                          <div className="p-1.5 rounded-lg bg-teal-500/20">
                            <CreditCard
                              className={`w-4 h-4 ${index === 0 ? 'text-teal-400' : 'text-gray-400'}`}
                            />
                          </div>
                          <span className="text-sm text-gray-300 flex-1">{action}</span>
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 ${
                              index === 0
                                ? 'bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]'
                                : 'bg-gray-400'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <GlassCard>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg">AI Generated Summary</h3>
                      </div>
                      <button
                        type="button"
                        onClick={copySummary}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
                        title="Copy summary"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                      <ul className="text-sm text-gray-300 leading-relaxed list-disc list-inside space-y-1">
                        {analysis.documentation.summary_bullets?.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                      {analysis.documentation.soap && (
                        <div className="pt-3 border-t border-white/10 text-xs text-gray-400 space-y-1">
                          <p>
                            <strong className="text-gray-300">S:</strong>{' '}
                            {analysis.documentation.soap.S}
                          </p>
                          <p>
                            <strong className="text-gray-300">O:</strong>{' '}
                            {analysis.documentation.soap.O}
                          </p>
                          <p>
                            <strong className="text-gray-300">A:</strong>{' '}
                            {analysis.documentation.soap.A}
                          </p>
                          <p>
                            <strong className="text-gray-300">P:</strong>{' '}
                            {analysis.documentation.soap.P}
                          </p>
                        </div>
                      )}
                      {analysis.documentation.follow_up_tasks?.length > 0 && (
                        <div className="pt-2">
                          <span className="text-xs text-gray-500">Follow-up: </span>
                          <span className="text-xs text-gray-400">
                            {analysis.documentation.follow_up_tasks.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {debugMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <DebugPanel
                      data={analysis}
                      metadata={{
                        model: analysis.model_used,
                        latency: `${analysis.latency_s}s`,
                        requestId: analysis.request_id,
                      }}
                    />
                  </motion.div>
                )}
              </>
            ) : (
              <GlassCard className="py-20">
                <div className="text-center text-gray-400">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(59,130,246,0.3)',
                        '0 0 40px rgba(59,130,246,0.5)',
                        '0 0 20px rgba(59,130,246,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-10 h-10 text-blue-400" />
                  </motion.div>
                  <h3 className="text-xl mb-2">Ready for AI Analysis</h3>
                  <p className="text-sm">
                    Enter a transcript and click &quot;Run AI Analysis&quot; to begin
                  </p>
                  {backendOnline === false && (
                    <p className="text-sm text-amber-400 mt-2">
                      Start the backend (uvicorn) on port 8000 and refresh.
                    </p>
                  )}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>

      <AIChatAssistant />
    </div>
  );
}
