import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supaBaseClient';
import { Product } from '../types/products';

const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const raw = searchTerm.trim();
  if (!raw) return [];

  const words = Array.from(new Set(raw.toLowerCase().split(/\s+/).filter(Boolean)));
  const FIELDS = ['name', 'brand', 'type', 'category'];

  const queries = words.map((word) =>
    supabase
      .from('products')
      .select('*')
      .or(FIELDS.map((f) => `${f}.ilike.%${word}%`).join(','))
      .limit(500)
  );

  const results = await Promise.all(queries);

  for (const r of results) {
    if (r.error) throw new Error(r.error.message);
  }

  const sets = results.map((r) => new Map((r.data ?? []).map((p) => [p.id, p])));
  const [first, ...rest] = sets;
  const intersected: Product[] = [];

  first.forEach((product, id) => {
    if (rest.every((s) => s.has(id))) intersected.push(product);
  });

  if (!intersected.length) return [];

  const scored = intersected
    .map((p) => {
      const haystack = FIELDS.map((f) => (p as unknown as Record<string, unknown>)[f] ?? '')
        .join(' ')
        .toLowerCase();
      let score = 0;
      if (haystack.includes(raw.toLowerCase())) score += 10;
      words.forEach((w) => {
        if (haystack.includes(w)) score += 1;
      });
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product);

  return scored;
};

export const useSearchProducts = (searchTerm: string | undefined, enabled: boolean = true) => {
  return useQuery<Product[], Error>({
    queryKey: ['search', searchTerm],
    queryFn: () => searchProducts(searchTerm!),
    enabled: enabled && !!searchTerm?.trim(),
    staleTime: 2 * 60 * 1000,
  });
};
