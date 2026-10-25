// app/restaurant/[id]/page.tsx — the restaurant page, /restaurant/1
// The rule of this file: call the API, print what it sends. It does not add,
// divide, sort, or round anything. Every decision about DATA lives in the API.

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(async (response) => {
        if (response.ok) setData(await response.json());
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <p className="text-sm text-[#78716c]">Loading…</p>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <p className="text-lg">Restaurant not found.</p>
        <p className="mt-2 text-sm text-[#78716c]">
          Either that link is wrong, or this restaurant was never added.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* --- Screen section 1: who this is --- */}
      <h1 className="text-3xl font-semibold tracking-tight text-[#1a1a18]">
        {data.name}
      </h1>
      <p className="mt-1 text-sm text-[#78716c]">
        {data.cuisine} · {data.area}
      </p>

      {data.totalReviews === 0 ? (
        /* --- The empty state: honest, and an invitation --- */
        <section className="mt-14 rounded-xl border border-[#e7e2d9] p-8 text-center">
          <p className="text-lg text-[#1a1a18]">No reviews yet.</p>
          <p className="mt-1 text-sm text-[#78716c]">
            This page stays quiet until someone leaves the first one.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-6 inline-block rounded-lg bg-[#1a1a18] px-5 py-2.5 text-sm text-white"
          >
            Write the first review
          </Link>
        </section>
      ) : (
        <>
          {/* --- Screen section 2: the number your eye lands on first.
              THE AVERAGE LINE: the API computed 4.5; this prints 4.5. --- */}
          <section className="mt-12 flex items-baseline gap-3">
            <p className="text-7xl font-semibold tracking-tight text-[#1a1a18]">
              {data.averageRating}
            </p>
            <p className="text-sm text-[#78716c]">
              {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
            </p>
          </section>

          {/* --- Screen section 3: the latest review, set apart --- */}
          <section className="mt-12 rounded-xl border border-[#e7e2d9] bg-[#f5f2ec] p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[#b45309]">
              Latest
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[#1a1a18]">
              {data.latestReview?.comment}
            </p>
            <p className="mt-3 text-sm text-[#78716c]">
              {"★".repeat(data.latestReview?.rating ?? 0)}
              {"☆".repeat(5 - (data.latestReview?.rating ?? 0))}
            </p>
          </section>

          {/* --- Screen section 4: the older reviews, plainly --- */}
          <section className="mt-12">
            <ul className="divide-y divide-[#e7e2d9]">
              {data.reviews.map((review) => (
                <li key={review.id} className="py-6">
                  <p className="text-sm text-[#b45309]">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </p>
                  <p className="mt-2 leading-relaxed text-[#1a1a18]">
                    {review.comment}
                  </p>
                  <p className="mt-2 text-xs text-[#78716c]">
                    {new Date(review.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>

            {/* --- Screen section 5: how to add to this --- */}
            <div className="mt-12 pb-4">
              <Link
                href={`/review/${id}`}
                className="inline-block rounded-lg bg-[#1a1a18] px-5 py-2.5 text-sm text-white"
              >
                Write a review
              </Link>
            </div>
          </section>
        </>
      )}
    </Shell>
  );
}

// The one-column, 560px, centred frame every element above sits inside.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#fafaf8]">
      <div className="mx-auto min-h-screen max-w-[560px] px-6 py-16">
        {children}
      </div>
    </main>
  );
}
