import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * One-time migration: copies the old standalone `heroPosts` and `trending`
 * collections into the unified `posts` collection, setting addToHero /
 * addToTrending flags so they show up under the new model.
 *
 * Safe to run multiple times — each source doc is tagged with legacyHeroId /
 * legacyTrendingId, and we skip any that have already been imported.
 */
export type MigrationResult = {
  heroImported: number;
  trendingImported: number;
  skipped: number;
};

export async function migrateLegacyContent(): Promise<MigrationResult> {
  const [postsSnap, heroSnap, trendingSnap] = await Promise.all([
    getDocs(collection(db, "posts")),
    getDocs(collection(db, "heroPosts")),
    getDocs(collection(db, "trending")),
  ]);

  // Track what's already been imported so re-runs don't duplicate.
  const importedHero = new Set<string>();
  const importedTrending = new Set<string>();
  postsSnap.docs.forEach((d) => {
    const data = d.data() as {
      legacyHeroId?: string;
      legacyTrendingId?: string;
    };
    if (data.legacyHeroId) importedHero.add(data.legacyHeroId);
    if (data.legacyTrendingId) importedTrending.add(data.legacyTrendingId);
  });

  const today = new Date().toLocaleDateString("en-GB");
  let heroImported = 0;
  let trendingImported = 0;
  let skipped = 0;

  // Hero posts -> posts (addToHero)
  for (const d of heroSnap.docs) {
    if (importedHero.has(d.id)) {
      skipped++;
      continue;
    }
    const h = d.data() as {
      title?: string;
      category?: string;
      image?: string;
      body?: string;
      date?: string;
    };
    await addDoc(collection(db, "posts"), {
      title: h.title || "Untitled",
      category: h.category || "",
      image: h.image || "",
      body: h.body || "",
      date: h.date || today,
      addToHero: true,
      addToTrending: false,
      trendingRank: null,
      legacyHeroId: d.id,
      createdAt: serverTimestamp(),
    });
    heroImported++;
  }

  // Trending -> posts (addToTrending, keep rank)
  for (const d of trendingSnap.docs) {
    if (importedTrending.has(d.id)) {
      skipped++;
      continue;
    }
    const t = d.data() as {
      title?: string;
      category?: string;
      image?: string;
      body?: string;
      date?: string;
      rank?: number;
    };
    await addDoc(collection(db, "posts"), {
      title: t.title || "Untitled",
      category: t.category || "",
      image: t.image || "",
      body: t.body || "",
      date: t.date || today,
      addToHero: false,
      addToTrending: true,
      trendingRank: typeof t.rank === "number" ? t.rank : null,
      legacyTrendingId: d.id,
      createdAt: serverTimestamp(),
    });
    trendingImported++;
  }

  return { heroImported, trendingImported, skipped };
}
