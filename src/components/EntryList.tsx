import { Calendar, Heart, Edit3, Trash2 } from 'lucide-react';
import { Sparkles, Loader2 } from 'lucide-react';
import { JournalEntry } from '../types/journal';

interface Props {
  entries: JournalEntry[];
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export default function EntryList({ entries, onEdit, onDelete }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No entries yet</h3>
        <p className="text-slate-500">Start your gratitude journey by writing your first entry!</p>
      </div>
    );
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-600 bg-green-100';
    if (mood >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getMoodColor(entry.mood)}`}>
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSentimentColor(entry.sentiment)}`}>
                    {entry.sentiment}
                  </span>
                  <span className="text-xs text-slate-500">
                    Mood: {entry.mood}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(entry)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gratitudes */}
          {entry.gratitudes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Gratitudes:</h4>
              <div className="space-y-1">
                {entry.gratitudes.map((gratitude, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="text-slate-700 text-sm">{gratitude}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {entry.content && (
            <div className="mb-4">
              <p className="text-slate-700 text-sm leading-relaxed">
                {entry.content.length > 200 
                  ? `${entry.content.substring(0, 200)}...` 
                  : entry.content
                }
              </p>
            </div>
          )}

          {/* Keywords */}
          {entry.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs capitalize"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* AI Insight */}
          {(entry.aiInsight || entry.aiInsightLoading) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h5 className="text-xs font-medium text-indigo-700 mb-1">AI Insight</h5>
                  {entry.aiInsightLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                      <span className="text-xs text-indigo-600 animate-pulse">Getting insights...</span>
                    </div>
                  ) : (
                    <p className="text-xs text-indigo-700 leading-relaxed">{entry.aiInsight}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
