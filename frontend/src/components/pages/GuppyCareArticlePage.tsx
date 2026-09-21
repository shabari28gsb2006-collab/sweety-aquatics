import React from 'react';
import { articleService } from '../../services/articleService';
import { ChevronLeft, Clock, Share2 } from 'lucide-react';
import { toastService } from '../../services/toastService';

interface GuppyCareArticlePageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const GuppyCareArticlePage: React.FC<GuppyCareArticlePageProps> = ({
  slug,
  onNavigate,
}) => {
  const article = articleService.getArticleBySlug(slug) || articleService.getAllArticles()[0];
  if (!article) return <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-slate-500">Loading care guide…</div>;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toastService.success('Link Copied', 'Article link copied to clipboard.');
    }
  };

  return (
    <article id="article-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <button
          onClick={() => onNavigate('/guppy-care')}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Care Hub
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#0875B5] bg-sky-50 px-3 py-1 rounded-full uppercase tracking-wider">
            {article.category}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {article.readTime}
          </span>
          <span className="text-xs text-slate-400">{article.publishedAt}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#032B42] font-['Manrope',sans-serif] leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {article.summary}
        </p>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-md">
        <img
          src={article.bannerImage}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Formatted Content */}
      <div className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {Array.isArray(article.content) ? (
          article.content.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#032B42] pt-2 border-b border-sky-50 pb-2">
                {sec.heading}
              </h2>
              {sec.body.map((p, pIdx) => (
                <p key={pIdx} className="text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
              {sec.tips && sec.tips.length > 0 && (
                <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100 space-y-2 mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0875B5]">
                    Care Notes
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                    {sec.tips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-slate-600">{String(article.content)}</p>
        )}

        <div className="pt-8 border-t border-sky-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Written by Sweety Birds &amp; Fishes Breeding Team</span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-[#0875B5] font-semibold hover:underline"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Article
          </button>
        </div>
      </div>
    </article>
  );
};
