// src/lib/crypto.ts

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const COINS = ['bitcoin', 'ethereum', 'solana', 'tether'];

export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets` +
        `?vs_currency=usd` +
        `&ids=${COINS.join(',')}` +
        `&order=market_cap_desc` +
        `&per_page=4&page=1&sparkline=false` +
        `&price_change_percentage=24h`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data = await res.json();

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
    }));
  } catch (err) {
    console.error('Crypto fetch error:', err);
    return [];
  }
}
