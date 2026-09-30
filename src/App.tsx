import { useState, useCallback, useEffect } from 'react';
import { Mail, Sparkles, Copy, Trash2, Save, Clock, Check, Inbox, X, Sun, Moon } from 'lucide-react';
import {
  generateEmail,
  type EmailType,
  type Tone,
  type EmailLength,
} from '@/lib/emailGenerator';
import { supabase, type SavedEmail } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';

const EMAIL_TYPES: EmailType[] = [
  'General',
  'Job Application',
  'Leave Request',
  'Meeting Request',
  'Thank You',
];

const TONES: Tone[] = ['Professional', 'Friendly', 'Formal', 'Casual'];
const LENGTHS: EmailLength[] = ['Short', 'Medium', 'Long'];

type FormState = {
  name: string;
  purpose: string;
  emailType: EmailType;
  tone: Tone;
  length: EmailLength;
};

const EMPTY_FORM: FormState = {
  name: '',
  purpose: '',
  emailType: 'General',
  tone: 'Professional',
  length: 'Medium',
};

export default function App() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  const loadSavedEmails = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from('saved_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryError) {
      setError('Could not load saved emails.');
    } else {
      setSavedEmails((data ?? []) as SavedEmail[]);
    }
    setIsLoadingHistory(false);
  }, []);

  useEffect(() => {
    loadSavedEmails();
  }, [loadSavedEmails]);

  const handleGenerate = () => {
    if (!form.purpose.trim()) {
      setError('Please enter the purpose of your email.');
      return;
    }
    setError('');
    setIsGenerating(true);

    setTimeout(() => {
      const email = generateEmail({
        name: form.name,
        purpose: form.purpose,
        emailType: form.emailType,
        tone: form.tone,
        length: form.length,
      });
      setResult(email);
      setSaveState('idle');
      setIsGenerating(false);
    }, 600);
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    setResult('');
    setError('');
    setSaveState('idle');
    setSaveMessage('');
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaveState('idle');
    setSaveMessage('');

    const { error: insertError } = await supabase
      .from('saved_emails')
      .insert({
        recipient_name: form.name.trim(),
        purpose: form.purpose.trim(),
        email_type: form.emailType,
        tone: form.tone,
        length: form.length,
        generated_email: result,
      });

    if (insertError) {
      setSaveState('error');
      setSaveMessage('Could not save email. Please try again.');
    } else {
      setSaveState('saved');
      setSaveMessage('Email saved to your history.');
      loadSavedEmails();
      setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 3000);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('saved_emails')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError('Could not delete saved email.');
    } else {
      setSavedEmails((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleLoadSaved = (email: SavedEmail) => {
    setForm({
      name: email.recipient_name,
      purpose: email.purpose,
      emailType: email.email_type as EmailType,
      tone: email.tone as Tone,
      length: email.length as EmailLength,
    });
    setResult(email.generated_email);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30">
              <Mail className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              AI MailGen
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Inbox className="w-4 h-4" />
              <span className="hidden sm:inline">Saved Emails</span>
              {savedEmails.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {savedEmails.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 pt-16 pb-12 px-5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-10 w-56 h-56 bg-cyan-200/20 dark:bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Powered Email Assistant
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
            Create Professional Emails
            <br />
            <span className="text-blue-600 dark:text-blue-400">in Seconds</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Generate professional, friendly, and formal emails with smart
            templates that adapt to your purpose.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="px-5 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up transition-colors">
            <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Email Generator
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                Enter your details and generate a polished email instantly.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Mr. Kumar"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Type
                  </label>
                  <SelectField
                    value={form.emailType}
                    options={EMAIL_TYPES}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, emailType: v as EmailType }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tone
                  </label>
                  <SelectField
                    value={form.tone}
                    options={TONES}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, tone: v as Tone }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Length
                  </label>
                  <SelectField
                    value={form.length}
                    options={LENGTHS}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, length: v as EmailLength }))
                    }
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  What is the purpose of the email?
                </label>
                <textarea
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purpose: e.target.value }))
                  }
                  placeholder="e.g. I want to apply for a Python Developer position..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400 font-medium animate-fade-in">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-blue-600/25"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate Email'}
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className="pt-3 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      Generated Email
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {copyState === 'copied' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveState === 'saved'}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/25 disabled:opacity-70 transition-colors"
                      >
                        {saveState === 'saved' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[280px] font-mono transition-colors">
                    {result}
                  </div>
                  {saveMessage && (
                    <p
                      className={`mt-2 text-xs font-medium animate-fade-in ${
                        saveState === 'error'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {saveMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white mb-10">
            Why Use AI MailGen?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                title: 'Fast',
                desc: 'Generate polished emails within seconds.',
                color:
                  'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15',
              },
              {
                icon: Mail,
                title: 'Professional',
                desc: 'Create clear and professional messages.',
                color:
                  'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/15',
              },
              {
                icon: Save,
                title: 'Savable',
                desc: 'Keep a history of your generated emails.',
                color:
                  'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/60 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <feature.icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-8 px-5 text-center text-sm">
        <p>&copy; 2026 AI MailGen</p>
      </footer>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full overflow-y-auto animate-slide-up transition-colors">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Saved Emails
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-5">
              {isLoadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : savedEmails.length === 0 ? (
                <div className="text-center py-16">
                  <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    No saved emails yet
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Generate an email and save it to see it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedEmails.map((email) => (
                    <div
                      key={email.id}
                      className="group rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {email.email_type}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(email.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSaved(email.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                        {email.generated_email}
                      </p>
                      <button
                        onClick={() => handleLoadSaved(email)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Load into editor →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-white dark:bg-slate-800 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
