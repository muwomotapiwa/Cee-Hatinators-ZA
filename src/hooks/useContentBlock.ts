import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ContentBlock {
  title: string;
  subtitle: string;
  body: string;
  media_url: string | null;
  button_label: string | null;
  button_url: string | null;
}

export function useContentBlock(pageKey: string, blockKey: string, fallback: ContentBlock) {
  const [block, setBlock] = useState<ContentBlock>(fallback);

  useEffect(() => {
    let active = true;

    supabase
      .from('site_content_blocks')
      .select('title, subtitle, body, media_url, button_label, button_url')
      .eq('page_key', pageKey)
      .eq('block_key', blockKey)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error || !data) return;

        setBlock({
          title: data.title || fallback.title,
          subtitle: data.subtitle || fallback.subtitle,
          body: data.body || fallback.body,
          media_url: data.media_url || fallback.media_url,
          button_label: data.button_label || fallback.button_label,
          button_url: data.button_url || fallback.button_url,
        });
      });

    return () => {
      active = false;
    };
  }, [pageKey, blockKey]);

  return block;
}
