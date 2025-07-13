"use client";

import React, { useEffect, useState } from "react";

interface Day {
  date: string;
  count: number;
}

interface Week {
  contributionDays: Day[];
}

interface ContributionData {
  weeks: Week[];
}

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const GITHUB_USERNAME = "aryamanj250";
// You need to provide a GitHub personal access token with public_repo scope
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

async function fetchContributionData(): Promise<ContributionData | null> {
  if (!GITHUB_TOKEN) return null;
  const query = `
    query {
      user(login: \"${GITHUB_USERNAME}\") {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!json.data) return null;
  return json.data.user.contributionsCollection.contributionCalendar;
}

const SQUARE_SIZE = 14;
const SQUARE_GAP = 3;
const RADIUS = 3;

export default function GithubContributionGrid() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributionData().then((data) => {
      if (data) setWeeks(data.weeks);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading contributions…</div>;
  }
  if (!weeks.length) {
    return <div className="text-center text-muted-foreground">No contribution data found.</div>;
  }

  // SVG grid: columns = weeks, rows = days (Mon-Sun)
  const numRows = 7;
  const numCols = weeks.length;
  const width = numCols * (SQUARE_SIZE + SQUARE_GAP);
  const height = numRows * (SQUARE_SIZE + SQUARE_GAP);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        width={width}
        height={height}
        style={{ background: "none", display: "block" }}
      >
        {weeks.map((week, x) =>
          week.contributionDays.map((day, y) => {
            const filled = day.count > 0;
            return (
              <rect
                key={day.date}
                x={x * (SQUARE_SIZE + SQUARE_GAP)}
                y={y * (SQUARE_SIZE + SQUARE_GAP)}
                width={SQUARE_SIZE}
                height={SQUARE_SIZE}
                rx={RADIUS}
                fill={filled ? "#fff" : "none"}
                stroke="#fff"
                strokeWidth={1.2}
                style={{ transition: "fill 0.2s" }}
              >
                <title>
                  {day.date}: {day.count} contributions
                </title>
              </rect>
            );
          })
        )}
      </svg>
    </div>
  );
} 