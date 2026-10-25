// app/api/reviews/route.ts — answers POST /api/reviews
// The contract: receive { restaurantId, rating, comment } as JSON.
// Check, in order: rating, comment, restaurant exists. First failure -> 400.
// On success: insert ONE row into reviews, return 201 with its id.

import { NextResponse } from "next/server";
import { sql } from "../../../db/neon";

export async function POST(request: Request) {
  let body: {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Check 1 — rating: a whole number from 1 to 5.
  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // Check 2 — comment: text, non-empty after trimming whitespace.
  const comment = body.comment;
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Please write a comment before submitting." },
      { status: 400 }
    );
  }

  // Check 3 — restaurant: must actually exist. This one asks the database.
  const restaurantId = body.restaurantId;
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return NextResponse.json(
      { error: "Restaurant not found." },
      { status: 400 }
    );
  }

  const existing = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (existing.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 400 });
  }

  // All checks passed — write exactly one fact row. Nothing else changes.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
