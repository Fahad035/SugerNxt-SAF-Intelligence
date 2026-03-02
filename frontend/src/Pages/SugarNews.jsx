import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RSS_SOURCE_URL =
  "https://news.google.com/rss/search?q=sugar+market+business&hl=en-US&gl=US&ceid=US:en";
const SOURCE_FILTER_STORAGE_KEY = "sugar_news_selected_source";
const NEWS_CACHE_STORAGE_KEY = "sugar_news_cache_v1";
const NEWS_CACHE_MAX_AGE_MS = 1000 * 60 * 60;

const FALLBACK_NEWS = [
  {
    title: "Global sugar prices fluctuate as Brazil output expectations shift",
    source: "Market Watch",
    pubDate: new Date().toISOString(),
    link: "https://www.reuters.com/",
  },
  {
    title: "India export policy updates influence short-term sugar trade",
    source: "Business Standard",
    pubDate: new Date().toISOString(),
    link: "https://www.bloomberg.com/",
  },
  {
    title: "Ethanol blending demand continues to affect raw sugar supply",
    source: "Commodity Insights",
    pubDate: new Date().toISOString(),
    link: "https://www.cnbc.com/",
  },
];

function readCachedNews() {
  try {
    const raw = localStorage.getItem(NEWS_CACHE_STORAGE_KEY);
    if (!raw) {
      return { articles: [], lastUpdated: "" };
    }

    const parsed = JSON.parse(raw);
    const age = Date.now() - Number(parsed.cachedAt || 0);
    if (!Array.isArray(parsed.articles) || age > NEWS_CACHE_MAX_AGE_MS) {
      return { articles: [], lastUpdated: "" };
    }

    return {
      articles: parsed.articles,
      lastUpdated: parsed.lastUpdated || "",
    };
  } catch {
    return { articles: [], lastUpdated: "" };
  }
}

function writeCachedNews(articles, lastUpdated) {
  try {
    localStorage.setItem(
      NEWS_CACHE_STORAGE_KEY,
      JSON.stringify({
        cachedAt: Date.now(),
        articles,
        lastUpdated,
      })
    );
  } catch {
    return;
  }
}

export default function SugarNews() {
  const cachedNews = readCachedNews();
  const [articles, setArticles] = useState(cachedNews.articles);
  const [isLoading, setIsLoading] = useState(cachedNews.articles.length === 0);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(cachedNews.lastUpdated);
  const articlesRef = useRef(cachedNews.articles);
  const [selectedSource, setSelectedSource] = useState(() => {
    try {
      return localStorage.getItem(SOURCE_FILTER_STORAGE_KEY) || "All";
    } catch {
      return "All";
    }
  });

  const extractSourceFromLink = (link) => {
    try {
      const hostname = new URL(link).hostname.replace("www.", "");
      const root = hostname.split(".")[0];
      return root
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } catch {
      return "Sugar Market Feed";
    }
  };

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
        RSS_SOURCE_URL
      )}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Unable to fetch market news feed.");
      }

      const data = await response.json();
      const mapped = (data.items || []).slice(0, 12).map((item) => ({
        title: item.title,
        source:
          (item.author && item.author.trim()) ||
          (item.source_id && item.source_id.trim()) ||
          extractSourceFromLink(item.link),
        pubDate: item.pubDate,
        link: item.link,
      }));

      const finalArticles = mapped.length > 0 ? mapped : FALLBACK_NEWS;
      const updatedAt = new Date().toLocaleString();

      setArticles(finalArticles);
      setLastUpdated(updatedAt);
      writeCachedNews(finalArticles, updatedAt);
    } catch (err) {
      const updatedAt = new Date().toLocaleString();
      const fallbackArticles =
        articlesRef.current.length > 0 ? articlesRef.current : FALLBACK_NEWS;

      setArticles(fallbackArticles);
      setError(err.message || "Unable to load live feed. Showing fallback updates.");
      setLastUpdated(updatedAt);
      writeCachedNews(fallbackArticles, updatedAt);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(SOURCE_FILTER_STORAGE_KEY, selectedSource);
    } catch {
      return;
    }
  }, [selectedSource]);

  const sourceOptions = useMemo(
    () => [
      "All",
      ...Array.from(new Set(articles.map((article) => article.source))).sort((a, b) =>
        a.localeCompare(b)
      ),
    ],
    [articles]
  );

  useEffect(() => {
    if (selectedSource !== "All" && !sourceOptions.includes(selectedSource)) {
      setSelectedSource("All");
    }
  }, [selectedSource, sourceOptions]);

  const filteredArticles =
    selectedSource === "All"
      ? articles
      : articles.filter((article) => article.source === selectedSource);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-bg px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-panel premium-reveal p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="premium-heading premium-title sm:text-3xl">
                Daily Sugar Market News
              </h1>
              <p className="premium-subtitle mt-3">
                Live business and commodity updates relevant to the global sugar market.
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={loadNews}
                className="rounded-lg border border-brand-border/60 px-4 py-2 text-sm font-semibold text-brand-text transition hover:border-blue-400 hover:text-blue-300"
              >
                Refresh News
              </button>
              <p className="mt-2 text-xs text-brand-muted">Last updated: {lastUpdated || "Loading..."}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">
              {error}
            </div>
          )}
        </section>

        <section className="premium-panel premium-reveal premium-reveal-delay-1 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedSource === source
                    ? "border-blue-400 bg-blue-500/10 text-blue-300"
                    : "border-brand-border/60 text-brand-muted hover:border-blue-500/70 hover:text-brand-text"
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="premium-card h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredArticles.map((article, index) => (
              <article key={`${article.title}-${index}`} className="premium-card premium-reveal p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">{article.source}</p>
                <h2 className="mt-2 line-clamp-3 text-base font-semibold leading-6 text-brand-text">{article.title}</h2>
                <p className="mt-2 text-xs text-brand-muted">
                  {new Date(article.pubDate).toLocaleString()}
                </p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
                >
                  Read full article →
                </a>
              </article>
            ))}

            {!isLoading && filteredArticles.length === 0 && (
              <div className="premium-panel p-6 text-sm text-brand-muted md:col-span-2">
                No articles found for this source. Try another filter.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
