import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/ToastProvider";
import {
  api, getToken, type Product, type Category, type Retailer, type Testimonial, type Faq, type ProductQuery,
  type Address, type Order,
} from "../lib/api";

const EMPTY_PRODUCTS: Product[] = [];

function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[], initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);
  const refetch = useCallback(() => setRefetchTick((n) => n + 1), []);
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        // A TypeError here means the request never reached the API (offline / server down).
        if (e instanceof TypeError) toast.error(t("toast.loadFailed"));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchTick]);

  return { data, loading, error, refetch };
}

export function useProducts(query?: ProductQuery) {
  const key = JSON.stringify(query ?? {});
  return useFetch(() => api.getProducts(query), [key], [] as Product[]);
}

export function useProduct(name: string | undefined) {
  return useFetch(
    () => (name ? api.getProduct(name) : Promise.resolve(null)),
    [name],
    null as Product | null,
  );
}

export function useCategories() {
  return useFetch(() => api.getCategories(), [], [] as Category[]);
}

export function useRetailers() {
  return useFetch(() => api.getRetailers(), [], [] as Retailer[]);
}

export function useTestimonials() {
  return useFetch(() => api.getTestimonials(), [], [] as Testimonial[]);
}

export function useFaqs() {
  return useFetch(() => api.getFaqs(), [], [] as Faq[]);
}

export function useWishlist() {
  return useFetch(() => (getToken() ? api.getWishlist() : Promise.resolve(EMPTY_PRODUCTS)), [], EMPTY_PRODUCTS);
}

export function useAddresses() {
  return useFetch(() => (getToken() ? api.getAddresses() : Promise.resolve([])), [], [] as Address[]);
}

export function useOrders() {
  return useFetch(() => (getToken() ? api.getOrders() : Promise.resolve([])), [], [] as Order[]);
}

export function useOrder(id: string | undefined) {
  return useFetch(
    () => (id ? api.getOrder(id) : Promise.resolve(null)),
    [id],
    null as Order | null,
  );
}
