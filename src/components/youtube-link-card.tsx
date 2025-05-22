'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Youtube, ExternalLink } from 'lucide-react';

interface YouTubeLinkCardProps {
  url: string;
}

export function YouTubeLinkCard({ url }: YouTubeLinkCardProps) {
  // Basic extraction of video ID for a placeholder thumbnail if needed, or title
  let videoTitle = url;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com' || urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
      videoTitle = `YouTube Video: ${videoId}`;
    }
  } catch (e) {
    // Invalid URL, use as is
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
        <Youtube className="h-8 w-8 text-red-600" />
        <div className="flex-1">
          <CardTitle className="text-base line-clamp-1" title={videoTitle}>
            Related Video
          </CardTitle>
          <CardDescription className="text-xs line-clamp-1" title={url}>
            {url}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <a href={url} target="_blank" rel="noopener noreferrer">
            Watch on YouTube
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
