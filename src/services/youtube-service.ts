
'use server';

/**
 * @fileOverview Service for interacting with the YouTube Data API.
 */

export async function fetchFirstYouTubeVideo(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('YouTube API Key is not configured. Please set YOUTUBE_API_KEY in your .env file.');
    // Potentially throw an error or return a specific message if needed by the calling flow
    return null;
  }

  // The YouTube Data API v3 search endpoint
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1&type=video&relevanceLanguage=en&safeSearch=moderate`;

  try {
    const response = await fetch(url, { cache: 'no-store' }); // Disable caching for fresh results
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`YouTube API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    console.log('No YouTube video found for query:', query);
    return null;
  } catch (error) {
    console.error('Failed to fetch YouTube video:', error);
    return null;
  }
}
