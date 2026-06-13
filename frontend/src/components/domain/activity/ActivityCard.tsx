"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { CurrencyCode, ID } from "../../../types/common";
import { formatMoney } from "../../../lib/money";
import { cn } from "../../../lib/utils";
import { useCurrency } from "../../providers/CurrencyProvider";

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
  duration?: string;
  variant?: "grid" | "row";
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
  href,
  badge,
  duration,
  variant = "grid",
  isFavorite = false,
  onFavoriteClick
}: ActivityCardProps) {
  const { currency: displayCurrency } = useCurrency();

  return (
    <Link
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-travel-lg border border-travel-border bg-white transition-colors duration-300 hover:border-travel-primary/75 active:border-travel-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-travel-primary/60 focus-visible:ring-offset-2"
      )}
      href={href}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-travel-bg",
          variant === "row" ? "aspect-[16/10]" : "aspect-[16/11]"
        )}
      >
        <img
          alt={title}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:translate-x-[-1.5%] group-hover:translate-y-[-1%] group-hover:scale-[1.15] group-active:scale-[1.12]"
          src={imageUrl}
        />
        {badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 font-interface text-[11px] font-semibold text-travel-primary shadow-[0_8px_18px_rgba(26,26,26,0.10)]">
            {badge}
          </span>
        ) : null}
        {variant === "grid" ? <button
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
        </button> : null}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          variant === "row" ? "min-h-[132px] px-3.5 pb-2.5 pt-3" : "min-h-[128px] p-3.5"
        )}
      >
        <div className="truncate font-interface text-[12px] font-semibold leading-4 text-travel-muted">
          {location} · {category}
        </div>

        <h3 className="mt-1.5 line-clamp-2 min-h-[41px] font-brand text-[16px] font-bold leading-[1.28] text-travel-dark">
          {title}
        </h3>

        {variant === "row" && duration ? (
          <p className="mt-1.5 line-clamp-1 font-interface text-xs leading-4 text-travel-dark">
            {duration} · Free cancellation
          </p>
        ) : null}

        <div
          className={cn(
            "flex items-end justify-between gap-3 font-interface text-xs leading-5 text-travel-muted",
            variant === "row" ? "mt-1.5 pt-0" : "mt-auto pt-4"
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1">
            <Star className="size-3.5 fill-travel-rating text-travel-rating" />
            <span className="font-semibold text-travel-dark">{rating.toFixed(1)}</span>
            <span className="truncate">({reviewCount.toLocaleString()}+)</span>
          </span>
          <p className="whitespace-nowrap text-right text-sm font-semibold text-travel-dark">
            <span className="mr-1 text-[11px] font-normal text-travel-muted">From</span>
            {formatMoney(price, displayCurrency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
