import { describe, expect, it, vi } from "vitest";
import type { CyberClient } from "../core/cyberClient";
import { LevelService } from "../services/levelService";

const createMockSupabase = () => {
  const xpTable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null })
  };

  const usersTable = {
    upsert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ discord_id: "user-1" }], error: null })
    })
  };

  const tables: Record<string, unknown> = {
    xp: xpTable,
    users: usersTable
  };

  const from = vi.fn((table: string) => {
    const target = tables[table];
    if (!target) {
      throw new Error(`Unexpected table ${table}`);
    }
    return target;
  });

  return { from, xpTable, usersTable };
};

const createClient = () => {
  const supabase = createMockSupabase();
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };

  const client = {
    supabase,
    logger
  } as unknown as Pick<CyberClient, "supabase" | "logger">;

  return { client, supabase };
};

describe("LevelService", () => {
  it("grants XP and ensures profile is created", async () => {
    const { client, supabase } = createClient();
    const service = new LevelService(client as CyberClient);

    const result = await service.addMessageXp("user-1", "tester#0001", 50);

    expect(result.newXp).toBe(50);
    expect(supabase.from).toHaveBeenCalledWith("xp");
    expect(supabase.xpTable.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "user-1", xp: 50 })
    );
    expect(supabase.from).toHaveBeenCalledWith("users");
  });
});
