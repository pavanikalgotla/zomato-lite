// app/api/restaurants/[id]/route.ts — answers GET /api/restaurants/1
// The contract: 404 if the restaurant doesn't exist. Otherwise, one response
// shaped like the screen: name, averageRating (computed), totalReviews
// (computed), latestReview (computed), then the rest of the reviews, newest first.
// Nothing here is ever stored — every number is computed at the moment of asking.

import { NextResponse } from "next/server";
import { sql } from "../../../../db/neon";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idText } = await params;
  const id = Number(idText);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurantRows = await sql`
    SELECT name, cuisine, area FROM restaurants WHERE id = ${id}
  `;
  if (restaurantRows.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurantRows[0];

  // The three lines of intelligence — computed fresh, from facts only.
  const stats = await sql`
    SELECT COUNT(*)::int AS total, AVG(rating) AS average
    FROM reviews WHERE restaurant_id = ${id}
  `;

  const reviewRows = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${id}
    ORDER BY created_at DESC, id DESC
  `;

  const toReview = (row: (typeof reviewRows)[number]) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
  });

  // Newest row is the highlighted one; every other row is the plain list,
  // newest first. The latest review is never printed twice.
  const [latest, ...older] = reviewRows;

  const average = stats[0].average;

  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    // Backend rounds to one decimal place — the frontend will only ever print.
    averageRating: average === null ? null : Math.round(Number(average) * 10) / 10,
    totalReviews: stats[0].total,
    latestReview: latest ? toReview(latest) : null,
    reviews: older.map(toReview),
  });
}
