import { TrendingUp, Heart, Calendar, Target } from 'lucide-react';
import { Sparkles, Loader2 } from 'lucide-react';
import { EmotionalInsight, ChartData } from '../types/journal';

interface Props {
  insights: EmotionalInsight[];
  chartData: ChartData[];
  onGenerateAISummary?: () => void;
}

export default function InsightsDashboard({ insights, chartData, onGenerateAISummary }: Props) {
  const currentInsight = insights[0]; // Most recent period

  if (!currentInsight) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No insights yet</h3>
        <p className="text-slate-500">Start writing entries to see your emotional patterns!</p>
      </div>
    );
  }

  const moodColor = currentInsight.averageMood >= 4 ? 'text-green-600' : 
                   currentInsight.averageMood >= 3 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold text-slate-800">
              {currentInsight.averageMood.toFixed(1)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Average Mood</h3>
          <p className={`text-xs ${moodColor}`}>{currentInsight.period}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-teal-500" />
            <span className="text-2xl font-bold text-slate-800">
              {currentInsight.streak}
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Day Streak</h3>
          <p className="text-xs text-slate-500">Keep it up! 🔥</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-amber-500" />
            <span className="text-2xl font-bold text-slate-800">
              {currentInsight.sentimentDistribution.positive.toFixed(0)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Positive Entries</h3>
          <p className="text-xs text-slate-500">Great outlook!</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-slate-800">{chartData.length}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Total Entries</h3>
          <p className="text-xs text-slate-500">Your journey</p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Emotional Balance</h3>
        <div className="space-y-3">
          {['positive', 'neutral', 'negative'].map((type) => {
            const value = currentInsight.sentimentDistribution[type as keyof typeof currentInsight.sentimentDistribution];
            const color = type === 'positive' ? 'bg-green-500' : type === 'neutral' ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`${color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-10">{value.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Common Themes */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Themes</h3>
        {currentInsight.commonThemes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {currentInsight.commonThemes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize"
              >
                {theme}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Write more entries to discover patterns!</p>
        )}
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-lg border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-indigo-800">AI Insights Summary</h3>
          </div>
          {!currentInsight.aiSummaryLoading && !currentInsight.aiSummary && (
            <button
              onClick={onGenerateAISummary}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
            >
              Generate Insights
            </button>
          )}
        </div>
        
        {currentInsight.aiSummaryLoading ? (
          <div className="flex items-center space-x-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-indigo-200 rounded animate-pulse"></div>
              <div className="h-3 bg-indigo-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-indigo-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ) : currentInsight.aiSummary ? (
          <div className="bg-white/50 p-4 rounded-lg">
            <p className="text-indigo-800 leading-relaxed">{currentInsight.aiSummary}</p>
          </div>
        ) : (
          <p className="text-indigo-600 text-sm">
            Get personalized insights about your gratitude journey and emotional patterns.
          </p>
        )}
      </div>
      {/* Mood Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Mood Over Time</h3>
          <div className="h-64 flex items-end space-x-2 overflow-x-auto">
            {chartData.slice(-30).map((data, index) => (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-sm transition-all duration-300 hover:from-indigo-600 hover:to-indigo-400"
                  style={{ 
                    height: `${(data.mood / 5) * 100}%`,
                    minHeight: '4px'
                  }}
                ></div>
                <span className="text-xs text-slate-500 mt-2 rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
