"use client";

import {useRouter, useSearchParams} from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const slugSchema = z
  .string()
  .regex(/^([a-z][a-z0-9]*)(-[a-z0-9]+)*$/)
  .min(3);

export default function HomeForm() {
  const [slug, setSlug] = useState("");
  const [validSlug, setValidSlug] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      slugSchema.parse(slug);
      setValidSlug(true);
    } catch {
      setValidSlug(false);
    }
  }, [slug]);

  return (
      <>
          <div className="flex items-center gap-2">
              <Input
                  className="w-[200px]"
                  type="text"
                  placeholder="example-stream"
                  onChange={(e) => {
                      setSlug(e.target.value);
                  }}
                  value={slug}
              />
              <Button
                  variant="secondary"
                  disabled={!validSlug}
                  onClick={() => router.push(`/channel/${slug}/host?${searchParams.toString()}`)}
              >
                  Join as host
              </Button>
              <Button
                  variant="secondary"
                  disabled={!validSlug}
                  onClick={() => router.push(`/channel/${slug}?${searchParams.toString()}`)}
              >
                  Join as viewer
              </Button>
          </div>
          <div className="text-xs text-gray-400 italic">Please enter a channel id that starts with a lowercase Latin letter and numbers. You can also include a hyphen. The string should be at least 3 characters long.</div>
      </>
  );
}
