/* Optional Supabase sync for chapter notes and lecture links only. */
(() => {
  const CONFIG_KEY = "sweety-ca-supabase-config-v1";
  let client = null, user = null, getState = null, applyState = null, timer = null, busy = false, lastPayload = "";
  const $ = selector => document.querySelector(selector);
  const config = () => { try { return JSON.parse(localStorage.getItem(CONFIG_KEY)) || {}; } catch { return {}; } };
  const cleanState = value => ({
    version: 3,
    notes: Object.fromEntries(Object.entries(value.progress || {}).flatMap(([key, item]) => {
      const shared = {};
      if (item.notesHtml) shared.notesHtml = item.notesHtml;
      if (item.noteSavedAt) shared.noteSavedAt = item.noteSavedAt;
      if (item.youtube) shared.youtube = item.youtube;
      return Object.keys(shared).length ? [[key, shared]] : [];
    }))
  });
  function status(text, kind = "") { const button = $("#sync-btn"); button.textContent = text; button.className = `sync-btn ${kind}`; }
  function message(text, error = false) { const el = $("#sync-message"); el.textContent = text; el.style.color = error ? "#b54545" : ""; }
  function show(panel) { ["setup", "auth", "connected"].forEach(name => $("#sync-" + name).hidden = name !== panel); }
  function connect() {
    const saved = config();
    if (!saved.url || !saved.key || !window.supabase) return false;
    client = window.supabase.createClient(saved.url, saved.key, { auth: { persistSession: true, autoRefreshToken: true } });
    client.auth.onAuthStateChange((_event, session) => { user = session?.user || null; updateUi(); if (user) setTimeout(loadOrCreate, 0); });
    client.auth.getSession().then(({ data }) => { user = data.session?.user || null; updateUi(); if (user) loadOrCreate(); });
    return true;
  }
  function updateUi() {
    if (!client) { show("setup"); status("☁ Set up sync"); return; }
    if (!user) { show("auth"); status("☁ Sign in to sync"); return; }
    show("connected"); $("#sync-user").textContent = user.email || "Signed in"; status("✓ Synced", "online");
  }
  async function loadOrCreate() {
    if (!user || busy) return;
    busy = true; status("↻ Syncing…", "syncing");
    try {
      const { data, error } = await client.from("ca_tracker_state").select("data,updated_at").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (data?.data) { applyState(data.data); lastPayload = JSON.stringify(cleanState(getState())); message("Your latest notes and links are loaded on this device."); }
      else await upload();
      status("✓ Synced", "online");
    } catch (error) { status("! Sync needs attention"); message(error.message || "Sync failed. Check the setup instructions.", true); }
    finally { busy = false; }
  }
  async function upload() {
    if (!user || !getState) return;
    const shared = cleanState(getState());
    const { error } = await client.from("ca_tracker_state").upsert({ user_id: user.id, data: shared, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
    lastPayload = JSON.stringify(shared);
  }
  function schedule() {
    if (!user) return;
    if (JSON.stringify(cleanState(getState())) === lastPayload) return;
    clearTimeout(timer);
    status("↻ Saving…", "syncing");
    timer = setTimeout(async () => { try { await upload(); status("✓ Synced", "online"); } catch { status("! Sync needs attention"); } }, 900);
  }
  async function auth(mode) {
    const email = $("#sync-email").value.trim(), password = $("#sync-password").value;
    if (!email || password.length < 6) return message("Enter a valid email and a password of at least 6 characters.", true);
    const result = mode === "up" ? await client.auth.signUp({ email, password }) : await client.auth.signInWithPassword({ email, password });
    if (result.error) return message(result.error.message, true);
    message(mode === "up" && !result.data.session ? "Account created. Confirm the email from Supabase, then sign in." : "Signed in successfully.");
  }
  window.cloudSync = {
    init(options) {
      getState = options.getState; applyState = options.applyState;
      $("#sync-btn").onclick = () => { updateUi(); $("#sync-dialog").showModal(); };
      $("#save-supabase").onclick = () => {
        const url = $("#supabase-url").value.trim().replace(/\/$/, ""), key = $("#supabase-key").value.trim();
        if (!/^https:\/\/.+\.supabase\.co$/.test(url) || !key) return message("Enter the project URL and publishable/anon key from Supabase.", true);
        localStorage.setItem(CONFIG_KEY, JSON.stringify({ url, key })); location.reload();
      };
      const saved = config(); $("#supabase-url").value = saved.url || ""; $("#supabase-key").value = saved.key || "";
      $("#sign-in").onclick = () => auth("in"); $("#sign-up").onclick = () => auth("up");
      $("#sync-now").onclick = loadOrCreate; $("#sign-out").onclick = async () => { await client.auth.signOut(); user = null; updateUi(); };
      connect(); updateUi();
    }, schedule
  };
})();
