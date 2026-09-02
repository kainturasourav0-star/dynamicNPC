import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limiter";

describe("Sliding Window Rate Limiter", () => {
  it("should permit requests below the allowed threshold", async () => {
    const id = "test_ip_allow_" + Date.now();
    const res1 = await checkRateLimit({ identifier: id, limit: 3, windowMs: 1000 });
    const res2 = await checkRateLimit({ identifier: id, limit: 3, windowMs: 1000 });

    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);
  });

  it("should block requests exceeding the allowed threshold", async () => {
    const id = "test_ip_block_" + Date.now();
    await checkRateLimit({ identifier: id, limit: 2, windowMs: 2000 });
    await checkRateLimit({ identifier: id, limit: 2, windowMs: 2000 });

    const blocked = await checkRateLimit({ identifier: id, limit: 2, windowMs: 2000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.reset).toBeGreaterThan(0);
  });
});
