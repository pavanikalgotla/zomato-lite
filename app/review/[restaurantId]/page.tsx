// app/review/[restaurantId]/page.tsx — the review form, /review/1
// Star picker, comment box, submit button. It displays the restaurant name
// (borrowed from the API) and does nothing clever anywhere in this file.

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setRestaurantName(data.name);
        }
      })
      .catch(() => {});
  }, [restaurantId]);

  // The submit gate: a rating is picked AND the comment holds actual text.
  // (Trailing spaces don't count. The backend will say the same thing — this
  // version is for kindness, not security.)
  const canSubmit =
    rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: Number(restaurantId),
        rating: rating,
        comment: comment,
      }),
    });

    if (response.ok) {
      router.push(`/restaurant/${restaurantId}`);
      return;
    }

    // If the API rejected us, print EXACTLY what it said. Never invent.
    try {
      const data = await response.json();
      setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Something went wrong.");
    }
    setSubmitting(false);
  }

  if (!restaurantName) {
    return (
      <Shell>
        <p className="text-lg">Restaurant not found.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* You should always know which restaurant you're reviewing */}
      <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a18]">
        Review {restaurantName}
      </h1>

      {/* --- The star picker: 1 to 5, one tap each --- */}
      <fieldset className="mt-12">
        <legend className="text-sm text-[#78716c]">Your rating</legend>
        <div className="mt-3 flex max-w-[220px] justify-between">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-4xl transition-colors ${
                n <= rating ? "text-[#b45309]" : "text-[#dcd7cd]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-2 h-5 text-sm text-[#78716c]">
          {rating >= 1 ? `${rating} of 5` : ""}
        </p>
      </fieldset>

      {/* --- The comment box --- */}
      <fieldset className="mt-10">
        <legend className="text-sm text-[#78716c]">Your comment</legend>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="What did you order, and how was it?"
          className="mt-3 w-full resize-none rounded-lg border border-[#e7e2d9] bg-white p-4 text-[15px] leading-relaxed text-[#1a1a18] placeholder:text-[#a8a29e] focus:border-[#b45309] focus:outline-none"
        />
      </fieldset>

      {/* --- The only place an API error is ever shown, verbatim --- */}
      {error && (
        <p className="mt-6 rounded-lg border border-[#e7e2d9] bg-[#f5f2ec] px-4 py-3 text-sm text-[#b45309]">
          {error}
        </p>
      )}

      {/* --- Submit: locked until the form is honestly complete --- */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-8 w-full rounded-lg bg-[#1a1a18] py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>

      <p className="mt-3 pb-4 text-center text-xs text-[#78716c]">
        Posted in seconds. Reviewed by no one, edited by no one.
      </p>
    </Shell>
  );
}

// The same quiet frame the restaurant page sits in — one body, 560px, centred.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#fafaf8]">
      <div className="mx-auto min-h-screen max-w-[560px] px-6 py-16">
        {children}
      </div>
    </main>
  );
}
