"use client";

import { Heart, Star } from "lucide-react";
import type { CurrencyCode, ID } from "../../../types/common";
import { formatMoney } from "../../../lib/money";
import { cn } from "../../../lib/utils";

type ActivityCardProps = {
  id: ID;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: CurrencyCode;
  href: string;
  badge?: string;
  isFavorite?: boolean;
  onFavoriteClick?: (id: ID) => void;
};

export function ActivityCard({
  id,
  title,
  category,
  location,
  imageUrl,
  rating,
  reviewCount,
  price,
  currency,
  href,
  badge,
  isFavorite = false,
  onFavoriteClick
}: ActivityCardProps) {
  return (
    <a
      className="group block overflow-hidden rounded-travel-lg border border-travel-border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-travel-primary/20 hover:shadow-[0_18px_36px_rgba(26,26,26,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary/30 focus-visible:ring-offset-2"
      href={href}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-travel-bg">
        <img
          alt={title}
          className="size-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
          src={imageUrl}
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-interface text-[11px] font-semibold text-travel-primary shadow-[0_8px_18px_rgba(26,26,26,0.10)]">
            {badge}
          </span>
        ) : null}
        <button
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-travel-dark opacity-0 shadow-[0_8px_18px_rgba(26,26,26,0.10)] transition group-hover:opacity-100 hover:bg-white hover:text-travel-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={(event) => {
            event.preventDefault();
            onFavoriteClick?.(id);
          }}
          type="button"
        >
          <Heart
            className={cn("size-4", isFavorite && "fill-travel-primary text-travel-primary")}
          />
        </button>
      </div>

      <div className="flex min-h-[138px] flex-col p-3.5">
        <div className="truncate font-interface text-[12px] font-medium leading-5 text-travel-muted">
          {category} | {location}
        </div>

        <h3 className="mt-1.5 line-clamp-2 min-h-[49px] font-brand text-[19px] font-bold leading-[1.28] text-travel-dark">
          {title}
        </h3>

        <div className="mt-2 flex items-center justify-between gap-3 font-interface text-xs leading-5 text-travel-muted">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Star className="size-3.5 fill-travel-rating text-travel-rating" />
            <span className="font-semibold text-travel-dark">{rating.toFixed(1)}</span>
            <span className="truncate">({reviewCount.toLocaleString()}+)</span>
          </span>
          <p className="whitespace-nowrap text-right text-sm font-semibold text-travel-dark">
            <span className="mr-1 text-[11px] font-normal text-travel-muted">From</span>
            {formatMoney(price, currency)}
          </p>
        </div>
      </div>
    </a>
  );
}
