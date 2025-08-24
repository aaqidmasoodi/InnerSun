import  { useState } from 'react';
import { useEffect } from 'react';
import { Plus, BarChart3, BookOpen, Download, Sparkles, LogOut, User } from 'lucide-react';
import JournalEntry from './components/JournalEntry';
import EntryList from './components/EntryList';
import InsightsDashboard from './components/InsightsDashboard';
import AuthForm from './components/AuthForm';
import { JournalEntry as JournalEntryType, ChartData } from './types/journal';
import { useAuth } from './hooks/useAuth';
import { useJournalEntries } from './hooks/useJournalEntries';
import { generateInsights, generateAISummary } from './utils/aiAnalyzer';

type View = 'entries' | 'insights';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { entries, loading: entriesLoading, saveEntry, updateEntry, deleteEntry } = useJournalEntries(user?.id);
  const [currentView, setCurrentView] = useState<View>('entries');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [insights, setInsights] = useState(() => generateInsights(entries));

  // Update insights when entries change
  useEffect(() => {
    setInsights(generateInsights(entries));
  }, [entries]);

  const handleGenerateAISummary = async () => {
    if (insights.length === 0) return;
    
    const currentInsight = insights[0];
    
    // Set loading state
    setInsights(prev => prev.map((insight, index) => 
      index === 0 
        ? { ...insight, aiSummaryLoading: true }
        : insight
    ));

    try {
      const aiSummary = await generateAISummary(currentInsight, entries.length);
      
      // Update with AI summary
      setInsights(prev => prev.map((insight, index) => 
        index === 0 
          ? { ...insight, aiSummary, aiSummaryLoading: false }
          : insight
      ));
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      // Remove loading state on error
      setInsights(prev => prev.map((insight, index) => 
        index === 0 
          ? { ...insight, aiSummaryLoading: false }
          : insight
      ));
    }
  };

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const chartData: ChartData[] = entries.map(entry => ({
    date: entry.date,
    mood: entry.mood,
    sentiment: entry.sentiment === 'positive' ? 1 : entry.sentiment === 'negative' ? -1 : 0
  }));

  const currentStreak = insights.length > 0 ? insights[0].streak : 0;
  const todayEntry = entries.find(entry => entry.date === new Date().toISOString().split('T')[0]);

  const handleSaveEntry = async (entryData: Omit<JournalEntryType, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
    try {
    if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
    } else {
        await saveEntry(entryData);
    }

    setShowEntryModal(false);
    setEditingEntry(null);
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleEditEntry = (entry: JournalEntryType) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `gratitude-journal-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  InnerSun
                </h1>
                {currentStreak > 0 && (
                  <p className="text-sm text-slate-600">
                    🔥 {currentStreak} day streak!
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* User Menu */}
              <div className="relative z-50">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
                
                {showUserMenu && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800">
                          {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                    {/* Click outside to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                  </>
                )}
              </div>

              <button
                onClick={exportData}
                disabled={entries.length === 0}
                className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-slate-100"
                title="Export entries"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowEntryModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {todayEntry ? 'Add Entry' : 'New Entry'}
                </span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-1 pb-4">
            <button
              onClick={() => setCurrentView('entries')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'entries'
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Entries</span>
            </button>
            <button
              onClick={() => setCurrentView('insights')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'insights'
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {entriesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-4 text-slate-600">Loading your entries...</p>
          </div>
        ) : (
          <>
        {/* Today's Entry Prompt - only show if no entry for today */}
        {!todayEntry && currentView === 'entries' && (
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Ready for today's gratitude?</h2>
                <p className="text-indigo-100">
                  Take a moment to reflect on what you're thankful for today.
                </p>
              </div>
              <button
                onClick={() => setShowEntryModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Start Writing
              </button>
            </div>
          </div>
        )}

        {/* Today's Entry Completed Message */}
        {todayEntry && currentView === 'entries' && (
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Today's gratitude recorded! ✨</h2>
                <p className="text-emerald-100">
                  You can add more entries for other dates or edit today's entry.
                </p>
              </div>
              <button
                onClick={() => setShowEntryModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                Add Another
              </button>
            </div>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === 'entries' ? (
          <EntryList
            entries={sortedEntries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <InsightsDashboard 
            insights={insights} 
            chartData={chartData} 
            onGenerateAISummary={handleGenerateAISummary}
          />
        )}
          </>
        )}
      </main>

      {/* Entry Modal */}
      {showEntryModal && (
        <JournalEntry
          onSave={handleSaveEntry}
          onCancel={() => {
            setShowEntryModal(false);
            setEditingEntry(null);
          }}
          initialEntry={editingEntry || undefined}
        />
      )}

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>✨ Your personal journey of gratitude and growth ✨</p>
      </footer>
    </div>
  );
}

export default App;
