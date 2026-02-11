const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface AnalyzeRequest {
  transcript: string;
  caller_context?: Record<string, unknown> | null;
  channel?: string | null;
  debug?: boolean | null;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  reason: string;
}

export interface TriageResult {
  urgency: string;
  red_flags_detected: string[];
  questions_to_ask: string[];
  reasoning: string;
}

export interface OrchestrationResult {
  route_to: string;
  next_best_actions: string[];
  suggested_script: string[];
  escalation_reason: string | null;
}

export interface SOAPNote {
  S: string;
  O: string;
  A: string;
  P: string;
}

export interface DocumentationResult {
  summary_bullets: string[];
  soap: SOAPNote;
  follow_up_tasks: string[];
}

export interface AnalyzeResponse {
  request_id: string;
  intent: IntentResult;
  triage: TriageResult;
  orchestration: OrchestrationResult;
  documentation: DocumentationResult;
  latency_s: number;
  model_used: string;
  warnings: string[];
  errors: string[];
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function transcribeAudio(file: File): Promise<{ transcript: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 503 ? 'Backend not configured (check OPENAI_API_KEY).' : text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function analyze(params: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 503 ? 'Backend not configured (check OPENAI_API_KEY).' : text || `HTTP ${res.status}`);
  }
  return res.json();
}
