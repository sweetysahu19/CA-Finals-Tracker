(function () {
  const config = window.SUPABASE_CONFIG || {};
  const configured = /^https:\/\/.+\.supabase\.co$/.test(config.url || "") && !String(config.publishableKey || "").includes("YOUR-");
  let client = null, user = null, getState = null, applyState = null, timer = null, initialized = false;
  function status(message, tone = "") { const button = document.querySelector("#sync-status"); if (button) { button.querySelector("span").textContent = message; button.dataset.tone = tone; button.title = tone === "success" ? "Database healthy — latest operation succeeded" : tone === "error" ? "Database unavailable — select to retry" : message; } }
  function showAuth() { document.querySelector("#auth-backdrop")?.classList.add("show"); }
  function hideAuth() { document.querySelector("#auth-backdrop")?.classList.remove("show"); }
  async function pushNow(state) {
    if (!client || !user) return;
    status("Saving…", "working");
    const { error } = await client.from("tracker_state").upsert({ user_id: user.id, state, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) { console.error("Supabase save failed", error); status("Sync failed", "error"); return; }
    status("Saved online", "success");
  }
  async function checkHealth() {
    if (!client || !user) return;
    const { error } = await client.from("tracker_state").select("user_id", { head: true, count: "exact" }).eq("user_id", user.id);
    status(error ? "Database unavailable" : "Database healthy", error ? "error" : "success");
  }
  async function loadRemote() {
    if (!client || !user) return;
    status("Loading…", "working");
    const { data, error } = await client.from("tracker_state").select("state").eq("user_id", user.id).maybeSingle();
    if (error) { console.error("Supabase load failed", error); status("Sync failed", "error"); return; }
    if (data?.state) applyState(data.state); else await pushNow(getState());
    status("Saved online", "success");
  }
  async function setUser(nextUser) {
    user = nextUser || null;
    document.querySelector("#sign-out")?.classList.toggle("show", !!user);
    if (user) { hideAuth(); await loadRemote(); }
    else status(configured ? "Sign in to sync" : "Set up Supabase", configured ? "" : "setup");
  }
  window.cloudSync = {
    schedule() { if (!initialized || !user) return; clearTimeout(timer); timer = setTimeout(() => pushNow(JSON.parse(JSON.stringify(getState()))), 650); },
    async init(options) {
      getState = options.getState; applyState = options.applyState; initialized = true;
      status(configured ? "Connecting…" : "Set up Supabase", configured ? "working" : "setup");
      if (!configured || !window.supabase?.createClient) return;
      client = window.supabase.createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data } = await client.auth.getSession(); await setUser(data.session?.user);
      client.auth.onAuthStateChange((_event, session) => setTimeout(() => setUser(session?.user), 0));
      setInterval(checkHealth, 60000);
    }
  };
  document.addEventListener("click", async event => {
    if (event.target.closest("#sync-status")) { if (!configured) return alert("Add your Supabase Project URL and publishable key in supabase-config.js first."); if (user) return pushNow(getState()); showAuth(); }
    if (event.target.closest("#auth-close")) hideAuth();
    if (event.target.closest("#sign-out") && client) await client.auth.signOut();
  });
  document.addEventListener("submit", async event => {
    const form = event.target.closest("#auth-form"); if (!form || !client) return;
    event.preventDefault(); const email = form.email.value.trim(), password = form.password.value, action = event.submitter?.value || "signin";
    const result = action === "signup" ? await client.auth.signUp({ email, password, options: { emailRedirectTo: location.href.split("#")[0] } }) : await client.auth.signInWithPassword({ email, password });
    const message = document.querySelector("#auth-message");
    if (result.error) message.textContent = result.error.message;
    else if (action === "signup" && !result.data.session) message.textContent = "Check your email to confirm the account, then sign in.";
    else message.textContent = "Signed in. Loading your tracker…";
  });
})();
