import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getJournalInsight(content: string, gratitudes: string[], mood: number): Promise<string> {
  try {
    const prompt = `As a supportive wellness coach, provide a brief, encouraging insight (max 2 sentences) about this journal entry:

Content: "${content}"
Gratitudes: ${gratitudes.join(', ')}
Mood: ${mood}/5

Focus on positive reinforcement, growth opportunities, or gentle suggestions. Be warm and supportive.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_completion_tokens: 150,
      top_p: 1,
      stream: false,
      stop: null
    });

    return chatCompletion.choices[0]?.message?.content || "Keep up the great work on your gratitude journey! 🌟";
  } catch (error) {
    console.error('Error getting journal insight:', error);
    return "Your reflection shows beautiful self-awareness. Keep nurturing your gratitude practice! ✨";
  }
}

export async function getOverallInsights(
  totalEntries: number,
  averageMood: number,
  streak: number,
  commonThemes: string[],
  sentimentDistribution: { positive: number; neutral: number; negative: number }
): Promise<string> {
  try {
    const prompt = `As a wellness analytics expert, provide encouraging insights (max 3 sentences) based on these gratitude journal metrics:

- Total entries: ${totalEntries}
- Average mood: ${averageMood.toFixed(1)}/5
- Current streak: ${streak} days
- Common themes: ${commonThemes.join(', ')}
- Sentiment: ${sentimentDistribution.positive.toFixed(0)}% positive, ${sentimentDistribution.neutral.toFixed(0)}% neutral, ${sentimentDistribution.negative.toFixed(0)}% negative

Highlight patterns, celebrate progress, and offer gentle guidance for continued growth.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_completion_tokens: 200,
      top_p: 1,
      stream: false,
      stop: null
    });

    return chatCompletion.choices[0]?.message?.content || "Your gratitude journey shows wonderful progress. Keep celebrating the small moments that bring you joy! 🌟";
  } catch (error) {
    console.error('Error getting overall insights:', error);
    return "Your consistent practice of gratitude is building a foundation for lasting happiness. Every entry is a step toward greater well-being! ✨";
  }
}