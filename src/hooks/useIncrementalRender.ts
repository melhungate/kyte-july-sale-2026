import { useCallback, useEffect, useState } from 'react';

// Mounting all ~3000 cards/tiles at once is what made typing in the search
// box and switching views take multiple seconds (React has to build and
// diff thousands of DOM nodes on every keystroke). Render only the first
// `pageSize` items, then grow by `pageSize` whenever a sentinel div at the
// bottom of the list scrolls into view.
export function useIncrementalRender(totalCount: number, pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  // A callback ref (rather than useRef + reading .current in an effect) so we
  // find out exactly when the sentinel mounts — it's rendered conditionally
  // (only in the currently-active view), so an effect keyed on unrelated deps
  // could run once before the node exists and never re-attach the observer.
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelEl(node);
  }, []);

  // A filter/search change produces a new totalCount (almost always) —
  // restart pagination from the top rather than keeping a stale scroll depth.
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [totalCount, pageSize]);

  useEffect(() => {
    if (!sentinelEl) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + pageSize, totalCount));
        }
      },
      { rootMargin: '800px' }
    );
    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [sentinelEl, totalCount, pageSize]);

  return { visibleCount: Math.min(visibleCount, totalCount), sentinelRef };
}
