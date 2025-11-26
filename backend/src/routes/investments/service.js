/**
 * Service - rota: investments
 * Usa o client centralizado do Supabase.
 */
import supabaseWrapper from "../../lib/supabase.js";
const { supabaseAdmin, dbQuery, applyPagination, buildMeta } = supabaseWrapper;

export async function list({ page = 1, pageSize = 20, userId = null } = {}) {
  const { from, to } = applyPagination(page, pageSize);
  const table = "investments";

  const res = await dbQuery(
    supabaseAdmin,
    (c) =>
      c
        .from(table)
        .select("*", { count: "exact" })
        .range(from, to)
        .order("date", { ascending: false }),
    { retry: 2, timeout: 9000, audit: true }
  );

  const total = (res && res.count) ? res.count : 0;
  const meta = buildMeta(total, page, pageSize);
  return { data: (res && res.data) ? res.data : [], meta };
}

export async function getById(id) {
  const table = "investments";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).select("*").eq("id", id).single());
  return (res && res.data) ? res.data : null;
}

export async function create(payload, opts = {}) {
  const table = "investments";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).insert([payload]).select().single());
  return (res && res.data) ? res.data : null;
}

export async function update(id, payload) {
  const table = "investments";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).update(payload).eq("id", id).select().single());
  return (res && res.data) ? res.data : null;
}

export async function remove(id) {
  const table = "investments";
  await dbQuery(supabaseAdmin, (c) => c.from(table).delete().eq("id", id));
  return true;
}
