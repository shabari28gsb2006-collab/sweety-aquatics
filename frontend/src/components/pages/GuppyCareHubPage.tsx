import React from 'react';
import { articleService } from '../../services/articleService';
import { CareArticle } from '../../types';
import { Clock, ArrowRight } from 'lucide-react';

interface GuppyCareHubPageProps {
  onNavigate: (route: string) => void;
  onSelectArticle: (slug: string) => void;
}

export const GuppyCareHubPage: React.FC<GuppyCareHubPageProps> = ({
  onNavigate,
  onSelectArticle,
}) => {
  const articles = articleService.getAllArticles();

  return (
    <div id="care-hub-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#021E31] via-[#064463] to-[#0875B5] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold text-[#50D4EE] uppercase tracking-wider">
            Aquatic Care Knowledge
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Manrope',sans-serif]">
            Guppy Care &amp; Breeding Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#E8F9FC]/90 leading-relaxed font-normal">
            Practical beginner-friendly guides for breeding, feeding, acclimation and seasonal aquarium care. Always adapt general guidance to your own aquarium conditions.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art.slug)}
            className="group bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 overflow-hidden bg-sky-50">
                <img
                  src={art.bannerImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#021E31]/80 backdrop-blur-xs text-[#50D4EE] text-[10px] font-bold px-3 py-1 rounded-lg">
                  {art.category}
                </span>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {art.readTime}
                  </span>
                  <span>{art.publishedAt}</span>
                </div>
                <h3 className="text-base font-bold text-[#032B42] group-hover:text-[#0875B5] transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {art.summary}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <span className="text-xs font-bold text-[#0875B5] group-hover:underline inline-flex items-center gap-1">
                Read Complete Guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
