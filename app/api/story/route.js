import { NextResponse } from "next/server";

const KEYS = {
  CLASSES: "mml-story:classes",
  ENTRIES: "mml-story:entries",
};

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Lazy import to avoid errors when env vars aren't set
  const { Redis } = require("@upstash/redis");
  return new Redis({ url, token });
}

export async function GET() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Cloud sync not configured" },
      { status: 501 }
    );
  }

  try {
    const [classes, entries] = await Promise.all([
      redis.get(KEYS.CLASSES),
      redis.get(KEYS.ENTRIES),
    ]);

    return NextResponse.json({
      classes: classes || [],
      entries: entries || [],
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read from storage" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Cloud sync not configured" },
      { status: 501 }
    );
  }

  try {
    const { classes, entries } = await request.json();

    await Promise.all([
      classes !== undefined && redis.set(KEYS.CLASSES, classes),
      entries !== undefined && redis.set(KEYS.ENTRIES, entries),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to write to storage" },
      { status: 500 }
    );
  }
}
