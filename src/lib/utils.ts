const rupiah = (n: number) =>
  "Rp " + (n ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

const formatShortDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return s;
  }
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export { rupiah, formatDate, formatShortDate, months, api };
