"use client";

import { Clock, Heart, MapPin, Star } from "lucide-react";
import type { CurrencyCode, ID } from "../../../types/common";
import { formatMoney } from "../../../lib/money";
import { cn } from "../../../lib/utils";

type ActivityCardProps = {
  id: ID;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  duration: string;
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
  duration,
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
      className="group block overflow-hidden rounded-travel-lg border border-travel-border bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-travel-primary/20 hover:shadow-[0_16px_34px_rgba(26,26,26,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary/30 focus-visible:ring-offset-2"
      href={href}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-travel-bg">
        <img
          alt={title}
          className="size-full object-cover transition duration-500 ease-out group-hover:scale-[1.025]"
          src={imageUrl}
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/95 px-2.5 py-1 font-interface text-[11px] font-semibold text-travel-primary shadow-[0_8px_18px_rgba(26,26,26,0.10)]">
            {badge}
          </span>
        ) : null}
        <button
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-travel-md border border-white/80 bg-white/90 text-travel-dark shadow-[0_8px_18px_rgba(26,26,26,0.10)] transition hover:bg-white hover:text-travel-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          onClick={(event) => {
            event.preventDefault();
            onFavoriteClick?.(id);
          }}
          type="button"
        >
          <Heart
            className={cn("size-[18px]", isFavorite && "fill-travel-primary text-travel-primary")}
          />
        </button>
      </div>

      <div className="flex min-h-[210px] flex-col p-4">
        <div className="flex items-center gap-1.5 font-interface text-xs font-medium text-travel-muted">
          <MapPin className="size-3.5 text-travel-muted/80" />
          <span className="truncate">
            {category} | {location}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-brand text-base font-bold leading-6 text-travel-dark">
          {title}
        </h3>

        <div className="mt-3 flex items-center gap-2 font-interface text-sm font-normal text-travel-muted">
          <Clock className="size-4 text-travel-muted/80" />
          <span>{duration}</span>
        </div>

        <div className="mt-3 flex items-center gap-1 font-interface text-sm">
          <Star className="size-4 fill-travel-rating text-travel-rating" />
          <span className="font-semibold text-travel-dark">{rating.toFixed(1)}</span>
          <span className="text-travel-muted">({reviewCount.toLocaleString()} reviews)</span>
        </div>

        <div className="mt-auto border-t border-travel-border pt-4">
          <p className="font-interface text-xs text-travel-muted">From</p>
          <p className="font-interface text-lg font-bold text-travel-dark">
            {formatMoney(price, currency)}
          </p>
        </div>
      </div>
    </a>
  );
}
