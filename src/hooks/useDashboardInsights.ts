import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EmotionalInsight } from '../types/journal';
import { generateInsights, generateAISummary } from '../utils/aiAnalyzer';
import { JournalEntry } from '../types/journal';

export function useDashboardInsights(userId: string | undefined, entries: JournalEntry[]) {
  const [insights, setInsights] = useState<EmotionalInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && entries.length > 0) {
      updateInsights();
    } else {
      setInsights(generateInsights(entries));
    }
  }, [userId, entries]);

  const updateInsights = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Generate current insights from entries
      const currentInsights = generateInsights(entries);
      
      if (currentInsights.length === 0) {
        setInsights([]);
        return;
      }

      const currentInsight = currentInsights[0];

      // Check if we have stored insights
      const { data: storedInsight, error: fetchError } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching stored insights:', fetchError);
        setInsights(currentInsights);
        return;
      }

      // Check if insights need to be updated
      const needsUpdate = !storedInsight || 
        storedInsight.total_entries !== entries.length ||
        Math.abs(storedInsight.average_mood - currentInsight.averageMood) > 0.1 ||
        storedInsight.streak !== currentInsight.streak;

      if (needsUpdate) {
        // Generate new AI summary
        const aiSummary = await generateAISummary(currentInsight, entries.length);
        
        // Prepare insight data for database
        const insightData = {
          user_id: userId,
          total_entries: entries.length,
          average_mood: currentInsight.averageMood,
          streak: currentInsight.streak,
          common_themes: currentInsight.commonThemes,
          sentiment_distribution: currentInsight.sentimentDistribution,
          ai_summary: aiSummary,
        };

        // Upsert the insights
        const { error: upsertError } = await supabase
          .from('user_insights')
          .upsert(insightData, { onConflict: 'user_id' });

        if (upsertError) {
          console.error('Error saving insights:', upsertError);
        }

        // Update local state with AI summary
        const updatedInsights = currentInsights.map((insight, index) => 
          index === 0 ? { ...insight, aiSummary } : insight
        );
        setInsights(updatedInsights);
      } else {
        // Use stored AI summary
        const updatedInsights = currentInsights.map((insight, index) => 
          index === 0 ? { ...insight, aiSummary: storedInsight.ai_summary } : insight
        );
        setInsights(updatedInsights);
      }
    } catch (error) {
      console.error('Error updating insights:', error);
      setInsights(generateInsights(entries));
    } finally {
      setLoading(false);
    }
  };

  const regenerateAISummary = async () => {
    if (!userId || insights.length === 0) return;

    try {
      const currentInsight = insights[0];
      
      // Set loading state
      setInsights(prev => prev.map((insight, index) => 
        index === 0 
          ? { ...insight, aiSummaryLoading: true }
          : insight
      ));

      // Generate new AI summary
      const aiSummary = await generateAISummary(currentInsight, entries.length);
      
      // Update database
      const { error } = await supabase
        .from('user_insights')
        .update({ ai_summary: aiSummary })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating AI summary:', error);
      }

      // Update local state
      setInsights(prev => prev.map((insight, index) => 
        index === 0 
          ? { ...insight, aiSummary, aiSummaryLoading: false }
          : insight
      ));
    } catch (error) {
      console.error('Error regenerating AI summary:', error);
      // Remove loading state on error
      setInsights(prev => prev.map((insight, index) => 
        index === 0 
          ? { ...insight, aiSummaryLoading: false }
          : insight
      ));
    }
  };

  return {
    insights,
    loading,
    regenerateAISummary,
  };
}