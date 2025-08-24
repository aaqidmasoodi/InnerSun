import { JournalEntry, EmotionalInsight } from '../types/journal';
import { getOverallInsights } from '../lib/groq';

const positiveWords = [
  'grateful', 'thankful', 'blessed', 'happy', 'joyful', 'peaceful', 'content',
  'loved', 'supported', 'accomplished', 'proud', 'excited', 'hopeful', 'amazing',
  'wonderful', 'beautiful', 'success', 'achievement', 'friendship', 'family',
  'health', 'progress', 'opportunity', 'growth', 'inspiration'
];

const negativeWords = [
  'stressed', 'worried', 'anxious', 'sad', 'frustrated', 'disappointed', 'angry',
  'overwhelmed', 'tired', 'difficult', 'challenging', 'struggle', 'problem',
  'issue', 'concern', 'fear', 'doubt', 'lonely', 'confused', 'upset'
];

export function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const words = text.toLowerCase().split(/\W+/);
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });

  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\W+/);
  const relevantWords = words.filter(word => 
    word.length > 3 && 
    !['that', 'this', 'with', 'have', 'will', 'been', 'were', 'they', 'them'].includes(word)
  );
  
  const wordCounts: { [key: string]: number } = {};
  relevantWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  return Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

export function calculateMoodFromSentiment(sentiment: string, gratitudeCount: number): number {
  const baseScore = sentiment === 'positive' ? 4 : sentiment === 'negative' ? 2 : 3;
  const gratitudeBonus = Math.min(gratitudeCount * 0.2, 1);
  return Math.min(5, Math.max(1, baseScore + gratitudeBonus));
}

export function generateInsights(entries: JournalEntry[]): EmotionalInsight[] {
  if (entries.length === 0) return [];

  const last30Days = entries.slice(-30);
  const last7Days = entries.slice(-7);

  const calculateInsight = (data: JournalEntry[], period: string): EmotionalInsight => {
    const averageMood = data.reduce((sum, entry) => sum + entry.mood, 0) / data.length;
    
    const sentimentCounts = data.reduce((acc, entry) => {
      acc[entry.sentiment]++;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    const total = data.length;
    const sentimentDistribution = {
      positive: (sentimentCounts.positive / total) * 100,
      neutral: (sentimentCounts.neutral / total) * 100,
      negative: (sentimentCounts.negative / total) * 100,
    };

    const allKeywords = data.flatMap(entry => entry.keywords);
    const keywordCounts: { [key: string]: number } = {};
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });

    const commonThemes = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    // Calculate streak
    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    for (let i = entries.length - 1; i >= 0; i--) {
      const entryDate = new Date(entries[i].date);
      const diffTime = currentDate.getTime() - entryDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = new Date(entryDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      period,
      averageMood,
      sentimentDistribution,
      commonThemes,
      streak,
    };
  };

  const insights = [];
  if (last7Days.length > 0) {
    insights.push(calculateInsight(last7Days, 'Last 7 days'));
  }
  if (last30Days.length > 0) {
    insights.push(calculateInsight(last30Days, 'Last 30 days'));
  }

  return insights;
}
export async function generateAISummary(
  insight: EmotionalInsight,
  totalEntries: number
): Promise<string> {
  return await getOverallInsights(
    totalEntries,
    insight.averageMood,
    insight.streak,
    insight.commonThemes,
    insight.sentimentDistribution
  );
}