import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { JournalEntry } from '../types/journal';
import { analyzeSentiment, extractKeywords } from '../utils/aiAnalyzer';
import { getJournalInsight } from '../lib/groq';

export function useJournalEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedEntries: JournalEntry[] = data.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        date: entry.date,
        content: entry.content,
        gratitudes: entry.gratitudes,
        mood: entry.mood,
        sentiment: entry.sentiment,
        keywords: entry.keywords,
        aiInsight: entry.ai_insight,
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at),
      }));

      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (entryData: Omit<JournalEntry, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;

    try {
      const sentiment = analyzeSentiment(entryData.content + ' ' + entryData.gratitudes.join(' '));
      const keywords = extractKeywords(entryData.content + ' ' + entryData.gratitudes.join(' '));

      const { data, error } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: userId,
          date: entryData.date,
          content: entryData.content,
          gratitudes: entryData.gratitudes,
          mood: entryData.mood,
          sentiment,
          keywords,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate AI insight in the background
      generateAIInsight(data.id, entryData.content, entryData.gratitudes, entryData.mood);

      await fetchEntries(); // Refresh the list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
      throw err;
    }
  };

  const generateAIInsight = async (entryId: string, content: string, gratitudes: string[], mood: number) => {
    try {
      // Update UI to show loading state
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, aiInsightLoading: true }
          : entry
      ));

      const insight = await getJournalInsight(content, gratitudes, mood);
      
      // Update database with AI insight
      const { error } = await supabase
        .from('journal_entries')
        .update({ ai_insight: insight })
        .eq('id', entryId);

      if (error) throw error;

      // Update UI with the insight
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, aiInsight: insight, aiInsightLoading: false }
          : entry
      ));
    } catch (err) {
      console.error('Failed to generate AI insight:', err);
      // Remove loading state on error
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, aiInsightLoading: false }
          : entry
      ));
    }
  };
  const updateEntry = async (id: string, entryData: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      let updateData = { ...entryData };

      // Re-analyze if content or gratitudes changed
      if (entryData.content !== undefined || entryData.gratitudes !== undefined) {
        const currentEntry = entries.find(e => e.id === id);
        if (currentEntry) {
          const content = entryData.content ?? currentEntry.content;
          const gratitudes = entryData.gratitudes ?? currentEntry.gratitudes;
          const sentiment = analyzeSentiment(content + ' ' + gratitudes.join(' '));
          const keywords = extractKeywords(content + ' ' + gratitudes.join(' '));
          
          updateData = {
            ...updateData,
            sentiment,
            keywords,
          };

          // Regenerate AI insight if content changed
          const mood = entryData.mood ?? currentEntry.mood;
          generateAIInsight(id, content, gratitudes, mood);
        }
      }

      const { error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await fetchEntries(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  };

  return {
    entries,
    loading,
    error,
    saveEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
    generateAIInsight,
  };
}