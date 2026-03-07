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
    image:
      "https://picsum.photos/seed/sugar-market-watch/900/520",
    summary:
      "Producers and traders are recalibrating near-term positions as weather and harvest estimates change in key producing regions.",
  },
  {
    title: "India export policy updates influence short-term sugar trade",
    source: "Business Standard",
    pubDate: new Date().toISOString(),
    link: "https://www.bloomberg.com/",
    image:
      "https://picsum.photos/seed/sugar-india-trade/900/520",
    summary:
      "Policy changes are affecting contract timing and destination mix, especially for buyers balancing domestic and import strategies.",
  },
  {
    title: "Ethanol blending demand continues to affect raw sugar supply",
    source: "Commodity Insights",
    pubDate: new Date().toISOString(),
    link: "https://www.cnbc.com/",
    image:
      "https://picsum.photos/seed/sugar-ethanol-demand/900/520",
    summary:
      "Biofuel demand is reshaping mill allocation decisions between sugar and ethanol streams in multiple markets.",
  },
];

function stripHtml(input) {
  return String(input || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageFromItem(item) {
  if (item?.thumbnail) return item.thumbnail;
  if (item?.enclosure?.link) return item.enclosure.link;

  const html = `${item?.description || ""} ${item?.content || ""}`;
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  const seed = encodeURIComponent(item?.title || item?.link || "sugar-news");
  return `https://picsum.photos/seed/${seed}/900/520`;
}

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
        image: extractImageFromItem(item),
        summary:
          stripHtml(item.description || item.content || "") ||
          "Open article for full market context and business impact details.",
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#f5f5f2] px-4 py-6 text-neutral-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="premium-reveal rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Market Intelligence</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                Daily Sugar Market News
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
                Live business and commodity updates relevant to the global sugar market.
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={loadNews}
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-900 hover:text-neutral-900"
              >
                Refresh News
              </button>
              <p className="mt-2 text-xs text-neutral-500">Last updated: {lastUpdated || "Loading..."}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </div>
          )}
        </section>

        <section className="premium-reveal premium-reveal-delay-1 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap gap-2">
            {sourceOptions.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedSource === source
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-600 hover:border-neutral-700 hover:text-neutral-900"
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
              <div key={item} className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredArticles.map((article, index) => (
              <article
                key={`${article.title}-${index}`}
                className="premium-reveal overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-200">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                    onError={(event) => {
                      event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(article.source)}/900/520`;
                    }}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{article.source}</p>
                    <p className="text-xs text-neutral-500">{new Date(article.pubDate).toLocaleDateString()}</p>
                  </div>

                  <h2 className="mt-2 line-clamp-3 text-base font-semibold leading-6 text-neutral-900">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-600">{article.summary}</p>

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Read full article
                  </a>
                </div>
              </article>
            ))}

            {!isLoading && filteredArticles.length === 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 md:col-span-2">
                No articles found for this source. Try another filter.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
