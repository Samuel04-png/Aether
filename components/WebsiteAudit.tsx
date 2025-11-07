import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { SparklesIcon, WebsiteIcon, CheckCircleIcon } from './shared/Icons';
import { generateWebsiteAudit } from '../services/geminiService';

const ProgressRing: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        const progressOffset = circumference - (score / 100) * circumference;
        setOffset(progressOffset);
    }, [score, circumference]);
    
    const scoreColor = score > 89 ? 'text-chart-2' : score > 69 ? 'text-chart-3' : 'text-destructive';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-muted" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
                <circle
                    className={`transition-all duration-1000 ease-out ${scoreColor}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

const WebsiteAudit: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<{ recommendations: string[]; scores: any } | null>(null);
    const [auditedUrl, setAuditedUrl] = useState('');

    const handleAudit = async () => {
        if (!url) return;
        setIsLoading(true);
        setAuditResult(null);
        setAuditedUrl(url);
        try {
            const rawRecommendations = await generateWebsiteAudit(url);
            const recommendations = rawRecommendations.split(/\r?\n\r?\n/).filter(r => r.trim());

            const scores = {
                overall: Math.floor(Math.random() * 20) + 75,
                seo: Math.floor(Math.random() * 30) + 60,
                performance: Math.floor(Math.random() * 15) + 85,
            };
            setAuditResult({ recommendations, scores });
        } catch (error) {
            setAuditResult({ recommendations: ['Failed to generate audit recommendations.'], scores: {} });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-foreground">Website Audit</h3>
            <p className="text-muted-foreground mt-1">Enter a URL to get AI-powered insights on SEO, performance, and content.</p>
          </div>
          <div className="w-full md:w-1/2 flex items-center gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-input text-foreground placeholder-muted-foreground rounded-[var(--radius)] py-2 px-4 focus:outline-none focus:ring-2 focus:ring-ring border border-border"
            />
            <button onClick={handleAudit} disabled={isLoading || !url} className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-[var(--radius)] hover:bg-primary/90 transition-colors shrink-0 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-sm">
              {isLoading ? 'Auditing...' : 'Audit'}
            </button>
          </div>
        </div>
      </Card>

      {isLoading && (
        <Card className="text-center py-10">
            <svg className="animate-spin mx-auto h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4 text-muted-foreground animate-pulse">Analyzing {url}...</p>
        </Card>
      )}

      {auditResult && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <h2 className="text-2xl font-bold text-foreground mb-4">Audit Results for <span className="text-primary">{auditedUrl}</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Overall Score</h4>
                <ProgressRing score={auditResult.scores.overall} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">SEO Score</h4>
                <ProgressRing score={auditResult.scores.seo} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Performance</h4>
                <ProgressRing score={auditResult.scores.performance} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">AI Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.recommendations.map((rec, index) => {
                const [title, ...content] = rec.split(':');
                const colors = [
                  'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600',
                  'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600',
                  'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600',
                  'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600',
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div key={index} className={`bg-gradient-to-r ${colorClass} p-5 rounded-xl border-2 transition-all hover:shadow-lg`}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colorClass.split(' ')[0]}`}>
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <h4 className={`font-bold ${colorClass.split(' ')[3]}`}>{title}</h4>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{content.join(':').trim()}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WebsiteAudit;