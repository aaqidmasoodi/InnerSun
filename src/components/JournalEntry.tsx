import { useState } from 'react';
import { Plus, X, Heart } from 'lucide-react';
import { JournalEntry as JournalEntryType } from '../types/journal';

interface Props {
  onSave: (entry: Omit<JournalEntryType, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialEntry?: JournalEntryType;
}

export default function JournalEntry({ onSave, onCancel, initialEntry }: Props) {
  const [content, setContent] = useState(initialEntry?.content || '');
  const [gratitudes, setGratitudes] = useState<string[]>(initialEntry?.gratitudes || ['']);
  const [mood, setMood] = useState(initialEntry?.mood || 3);

  const addGratitude = () => {
    if (gratitudes.length < 5) setGratitudes([...gratitudes, '']);
  };

  const removeGratitude = (index: number) => {
    setGratitudes(gratitudes.filter((_, i) => i !== index));
  };

  const updateGratitude = (index: number, value: string) => {
    const updated = [...gratitudes];
    updated[index] = value;
    setGratitudes(updated);
  };

  const handleSave = () => {
    const validGratitudes = gratitudes.filter(g => g.trim() !== '');
    
    // For new entries, always use current timestamp to ensure uniqueness
    // For editing, keep the original date
    const entryDate = initialEntry?.date || new Date().toISOString();

    onSave({
      date: entryDate,
      content,
      gratitudes: validGratitudes,
      mood,
      sentiment: 'positive',
      keywords: [],
    });
  };

  const canSave = content.trim() !== '' && gratitudes.some(g => g.trim() !== '');

  // Mood colors from red → yellow → green
  const moodColors = [
    'bg-red-500 text-white',    // Mood 1
    'bg-red-400 text-white',    // Mood 2
    'bg-yellow-400 text-white', // Mood 3
    'bg-lime-400 text-white',   // Mood 4
    'bg-green-500 text-white',  // Mood 5
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-lime-50 via-teal-50 to-amber-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-lime-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">
              {initialEntry ? 'Edit Entry' : 'New Gratitude Entry'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-lime-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-lime-600" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setMood(value)}
                    className={`p-3 rounded-full transition-all ${
                      mood === value
                        ? `${moodColors[value - 1]} scale-110 shadow-lg`
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${mood === value ? 'fill-current' : ''}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitudes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What are you grateful for?
              </label>
              <div className="space-y-3">
                {gratitudes.map((gratitude, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-lime-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-lime-700">{index + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={gratitude}
                      onChange={(e) => updateGratitude(index, e.target.value)}
                      placeholder="I'm grateful for..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                    />
                    {gratitudes.length > 1 && (
                      <button
                        onClick={() => removeGratitude(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {gratitudes.length < 5 && (
                <button
                  onClick={addGratitude}
                  className="mt-3 flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add another gratitude</span>
                </button>
              )}
            </div>

            {/* Journal Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reflect on your thoughts (optional)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write about your experiences, thoughts, feelings, or anything on your mind..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                canSave
                  ? 'bg-gradient-to-r from-lime-500 via-teal-500 to-amber-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
