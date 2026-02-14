// main.js — MyPa (simple + verbose)
// - Layout restricted to 1/2/3/4/20 (100/1000 removed)
// - Uses authorized-sites.json + AUTHORIZED_SITES env merge
// - UI: screens with dropdown -> iframe src, cache clear, scroll nav
// - Function-calling bridge: mypa_list_actions / mypa_call
// - PostMessage endpoint: MYPA_CALL / MYPA_RESPONSE (no origin allowlist; CSP frame-ancestors is assumed)
// - Child messaging:
//    a) generic iframe.postMessage (send any payload to child)
//    b) iframe.kizuna.call + iframe.kizuna.listActions (for Kizuna-like children using KIZUNA_CALL/KIZUNA_RESPONSE)
//
// Important note on Kizuna calls:
// - Yes: the Kizuna postMessage protocol is "variable enough" to call ANY tool name.
// - Requirement: the child must expose those tools in its Kizuna TOOLS (including meta.listActions).
// - If Kizuna is injected inline in a child site, and that child exposes extra tools, mypa can call them the same way.

(function () {
  // ------------------------------
  // CONFIG
  // ------------------------------
  const ALLOWED_SCREEN_COUNTS = [1, 2, 3, 4, 20];
  const GRID_MAX = 4; // CSS grid classes expected: grid-1..grid-4 (20 maps to 4)

  // Kizuna protocol constants
  const KIZUNA_CALL_TYPE = "KIZUNA_CALL";
  const KIZUNA_RESPONSE_TYPE = "KIZUNA_RESPONSE";

  // MyPa protocol constants
  const MYPA_CALL_TYPE = "MYPA_CALL";
  const MYPA_RESPONSE_TYPE = "MYPA_RESPONSE";

  // ------------------------------
  // STATE
  // ------------------------------
  let authorizedSites = [];

  // ------------------------------
  // BASIC HELPERS (keep simple)
  // ------------------------------
  function isAllowedCount(count) {
    return ALLOWED_SCREEN_COUNTS.includes(count);
  }

  function getMainContent() {
    const el = document.getElementById("main-content");
    if (!el) throw new Error("Missing #main-content");
    return el;
  }

  function removeGridClasses(el) {
    const remove = [];
    for (const c of el.classList) {
      if (String(c).startsWith("grid-")) remove.push(c);
    }
    remove.forEach((c) => el.classList.remove(c));
  }

  function safeOriginFromUrl(url) {
    try {
      return new URL(url, window.location.href).origin;
    } catch {
      return null;
    }
  }

  function getScreens() {
    return Array.from(getMainContent().querySelectorAll(".screen"));
  }

  function getIframes() {
    return Array.from(getMainContent().querySelectorAll(".screen iframe"));
  }

  function getSelects() {
    return Array.from(getMainContent().querySelectorAll(".screen select"));
  }

  function requireIframeByIndex(index) {
    const iframes = getIframes();
    if (!Number.isInteger(index) || index < 0 || index >= iframes.length) {
      throw new Error(`Invalid iframe index: ${index}. Range: 0..${Math.max(0, iframes.length - 1)}`);
    }
    return iframes[index];
  }

  function cleanSiteLabel(url) {
    const cleanUrl = String(url).replace(/^https:\/\//, "");
    if (cleanUrl.includes(".github.io/")) {
      const parts = String(url).split("/");
      return parts.pop().replace(/\/$/, "") || parts[parts.length - 2] || cleanUrl;
    }
    return cleanUrl.split(".")[0] || cleanUrl;
  }

  // ------------------------------
  // UI: Screens + dropdown + iframe
  // ------------------------------
  function createScreens(count) {
    const main = getMainContent();

    if (!isAllowedCount(count)) {
      throw new Error(`Screen count not allowed: ${count}. Allowed: ${ALLOWED_SCREEN_COUNTS.join(", ")}`);
    }

    // Reset container
    main.innerHTML = "";

    // Update grid class
    removeGridClasses(main);
    const gridClass = "grid-" + (count === 20 ? GRID_MAX : count);
    main.classList.add(gridClass);

    // Create N screens
    for (let i = 0; i < count; i++) {
      const screen = document.createElement("div");
      screen.className = "screen";
      screen.id = "screen-" + i;

      const select = document.createElement("select");

      const defaultOption = document.createElement("option");
      defaultOption.text = "Select a site";
      defaultOption.value = "";
      select.appendChild(defaultOption);

      // Add authorized sites as options
      for (const url of authorizedSites) {
        const option = document.createElement("option");
        option.value = url;
        option.text = cleanSiteLabel(url);
        select.appendChild(option);
      }

      const iframe = document.createElement("iframe");
      iframe.id = "iframe-" + i;

      // On change => set iframe src
      select.addEventListener("change", function () {
        iframe.src = this.value || "";
      });

      screen.appendChild(select);
      screen.appendChild(iframe);
      main.appendChild(screen);
    }
  }

  // ------------------------------
  // UI: Scroll navigation
  // ------------------------------
  function scrollToNextScreen() {
    const main = getMainContent();
    const screens = getScreens();
    const currentScroll = main.scrollTop;

    for (const screen of screens) {
      if (screen.offsetTop > currentScroll + 10) {
        main.scrollTo({ top: screen.offsetTop, behavior: "smooth" });
        break;
      }
    }
  }

  function scrollToPreviousScreen() {
    const main = getMainContent();
    const screens = getScreens();
    const currentScroll = main.scrollTop;

    let lastScreen = null;
    for (const screen of screens) {
      if (screen.offsetTop < currentScroll - 10) lastScreen = screen;
      else break;
    }

    if (lastScreen) {
      main.scrollTo({ top: lastScreen.offsetTop, behavior: "smooth" });
    }
  }

  function scrollToScreen(index) {
    const main = getMainContent();
    const screens = getScreens();

    if (!Number.isInteger(index) || index < 0 || index >= screens.length) {
      throw new Error(`Invalid screen index: ${index}`);
    }

    main.scrollTo({ top: screens[index].offsetTop, behavior: "smooth" });
  }

  // ------------------------------
  // DATA: merge authorized sites (json + env)
  // ------------------------------
  function mergeAuthorizedSites() {
    const envRaw = String(window.authorizedSitesFromEnv || "").trim();
    if (!envRaw) window.authorizedSitesFromEnv = "https://hongkoala.com/";

    return fetch("authorized-sites.json")
      .then((r) => r.json())
      .then((jsonData) => {
        const jsonSites = (jsonData && Array.isArray(jsonData.sites)) ? jsonData.sites : [];

        const envSites = String(window.authorizedSitesFromEnv || "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);

        const merged = Array.from(new Set([...jsonSites, ...envSites]));

        // Save to IndexedDB if available
        if (window.db?.setAuthorizedSites) {
          window.db.setAuthorizedSites(merged).catch((err) => console.error("IndexedDB save error:", err));
        }

        return merged;
      })
      .catch((err) => {
        console.error("authorized-sites.json fetch error:", err);

        const envSites = String(window.authorizedSitesFromEnv || "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);

        return envSites;
      });
  }

  function initializeAuthorizedSites(sites) {
    authorizedSites = Array.isArray(sites) ? sites : [];

    authorizedSites.sort((a, b) => {
      const nameA = String(a).replace(/^https:\/\//, "");
      const nameB = String(b).replace(/^https:\/\//, "");
      return nameA.localeCompare(nameB);
    });

    createScreens(1);
  }

  // ------------------------------
  // CACHE: clear Cache API
  // ------------------------------
  function clearCache() {
    if (!("caches" in window)) {
      alert("Cache API not supported in this browser.");
      return;
    }

    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => alert("Cache cleared successfully!"))
      .catch((err) => console.error("Error clearing cache:", err));
  }

  // ------------------------------
  // SERVICE WORKER
  // ------------------------------
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js")
        .then((reg) => console.log("Service Worker registered with scope:", reg.scope))
        .catch((err) => console.error("Service Worker registration failed:", err));
    });
  }

  // ------------------------------
  // FUNCTION CALLING: state
  // ------------------------------
  function mypa_state() {
    const iframes = getIframes();
    return {
      screens: getScreens().length,
      iframes: iframes.map((f, idx) => ({
        index: idx,
        id: f.id || null,
        src: f.getAttribute("src") || f.src || ""
      }))
    };
  }

  // ------------------------------
  // KIZUNA CALLS: simple request/response over postMessage
  // ------------------------------
  function kizuna_callOnIframe(iframeIndex, call, opts) {
    const iframe = requireIframeByIndex(iframeIndex);
    if (!iframe.contentWindow) throw new Error("iframe has no contentWindow");

    const src = iframe.getAttribute("src") || iframe.src || "";
    const origin = (opts && opts.targetOrigin) || safeOriginFromUrl(src) || "*";
    const timeoutMs = (opts && Number.isInteger(opts.timeoutMs)) ? opts.timeoutMs : 1500;

    // Unique request id
    const requestId = `MYPA_KZ:${iframeIndex}:${Date.now()}:${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve) => {
      function onMsg(event) {
        const d = event.data;
        if (!d || d.type !== KIZUNA_RESPONSE_TYPE || d.requestId !== requestId) return;

        window.removeEventListener("message", onMsg);
        clearTimeout(t);
        resolve({ ok: true, response: d.response });
      }

      const t = setTimeout(() => {
        window.removeEventListener("message", onMsg);
        resolve({ ok: false, error: "no-response" });
      }, timeoutMs);

      window.addEventListener("message", onMsg);

      // Send the call. This is variable enough to request ANY tool name,
      // as long as the child Kizuna exposes it inside TOOLS.
      iframe.contentWindow.postMessage(
        { type: KIZUNA_CALL_TYPE, requestId, call },
        origin
      );
    });
  }

  // ------------------------------
  // FUNCTION CALLING: tools (MyPa)
  // ------------------------------
  const TOOLS = {
    "layout.set": {
      description: "Set the number of screens (allowed: 1,2,3,4,20).",
      parameters: {
        type: "object",
        properties: { count: { type: "integer", enum: ALLOWED_SCREEN_COUNTS } },
        required: ["count"],
        additionalProperties: false
      },
      handler: async (args) => {
        createScreens(args.count);
        return { count: args.count };
      }
    },

    "iframes.list": {
      description: "List current screens/iframes and their URLs.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      handler: async () => mypa_state()
    },

    "iframe.setUrl": {
      description: "Set iframe URL by index (0-based). URL can be reused across multiple iframes.",
      parameters: {
        type: "object",
        properties: { index: { type: "integer", minimum: 0 }, url: { type: "string" } },
        required: ["index", "url"],
        additionalProperties: false
      },
      handler: async (args) => {
        const iframe = requireIframeByIndex(args.index);
        const selects = getSelects();
        const select = selects[args.index];

        // Prefer dropdown flow; if URL is not in options, still force iframe src.
        if (select) {
          select.value = args.url;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          iframe.src = args.url;
        } else {
          iframe.src = args.url;
        }

        return { index: args.index, url: args.url };
      }
    },

    "iframes.setUrls": {
      description: "Set multiple iframe URLs in one call (array mapped by index).",
      parameters: {
        type: "object",
        properties: { urls: { type: "array", items: { type: "string" } } },
        required: ["urls"],
        additionalProperties: false
      },
      handler: async (args) => {
        const iframes = getIframes();
        const max = Math.min(args.urls.length, iframes.length);

        const applied = [];
        for (let i = 0; i < max; i++) {
          const url = args.urls[i];
          if (!url) continue;
          applied.push(await TOOLS["iframe.setUrl"].handler({ index: i, url }));
        }

        return { appliedCount: applied.length, applied };
      }
    },

    "nav.next": {
      description: "Scroll to next screen in #main-content.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      handler: async () => {
        scrollToNextScreen();
        return { ok: true };
      }
    },

    "nav.prev": {
      description: "Scroll to previous screen in #main-content.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
      handler: async () => {
        scrollToPreviousScreen();
        return { ok: true };
      }
    },

    "nav.goto": {
      description: "Scroll to a specific screen index.",
      parameters: {
        type: "object",
        properties: { index: { type: "integer", minimum: 0 } },
        required: ["index"],
        additionalProperties: false
      },
      handler: async (args) => {
        scrollToScreen(args.index);
        return { ok: true, index: args.index };
      }
    },

    "iframe.postMessage": {
      description: "Send an arbitrary postMessage payload to a child iframe (generic).",
      parameters: {
        type: "object",
        properties: { index: { type: "integer", minimum: 0 }, payload: {}, targetOrigin: { type: "string" } },
        required: ["index", "payload"],
        additionalProperties: false
      },
      handler: async (args) => {
        const iframe = requireIframeByIndex(args.index);
        if (!iframe.contentWindow) throw new Error("iframe has no contentWindow");

        const src = iframe.getAttribute("src") || iframe.src || "";
        const origin = args.targetOrigin || safeOriginFromUrl(src) || "*";

        iframe.contentWindow.postMessage({ type: "MYPA_IFRAME_MESSAGE", payload: args.payload }, origin);
        return { ok: true, index: args.index, targetOrigin: origin };
      }
    },

    "iframe.kizuna.call": {
      description: "Call ANY Kizuna tool in the child iframe (requires child supports KIZUNA_CALL/KIZUNA_RESPONSE).",
      parameters: {
        type: "object",
        properties: {
          index: { type: "integer", minimum: 0 },
          name: { type: "string" },
          arguments: { type: "object" },
          timeoutMs: { type: "integer" },
          targetOrigin: { type: "string" }
        },
        required: ["index", "name"],
        additionalProperties: false
      },
      handler: async (args) => {
        const call = { name: args.name, arguments: args.arguments || {} };
        return await kizuna_callOnIframe(args.index, call, { timeoutMs: args.timeoutMs, targetOrigin: args.targetOrigin });
      }
    },

    "iframe.kizuna.listActions": {
      description: "Request Kizuna discovery (meta.listActions) from a child iframe.",
      parameters: {
        type: "object",
        properties: { index: { type: "integer", minimum: 0 }, timeoutMs: { type: "integer" }, targetOrigin: { type: "string" } },
        required: ["index"],
        additionalProperties: false
      },
      handler: async (args) => {
        const call = { name: "meta.listActions", arguments: {} };
        return await kizuna_callOnIframe(args.index, call, { timeoutMs: args.timeoutMs, targetOrigin: args.targetOrigin });
      }
    }
  };

  // Discovery
  window.mypa_list_actions = function () {
    return {
      tools: Object.entries(TOOLS).map(([name, t]) => ({
        name,
        description: t.description,
        parameters: t.parameters
      })),
      state: mypa_state()
    };
  };

  // Entrypoint
  window.mypa_call = async function (call) {
    try {
      const name = call?.name;
      const args = call?.arguments || {};
      const tool = TOOLS[name];

      if (!tool) {
        return {
          ok: false,
          error: "unknown_tool",
          available: Object.keys(TOOLS),
          state: mypa_state()
        };
      }

      console.info("[MYPA_FC]", { name, ts: Date.now() });
      const result = await tool.handler(args);
      return { ok: true, result: result ?? null, state: mypa_state() };
    } catch (e) {
      return { ok: false, error: "tool_failed", message: String(e?.message || e), state: mypa_state() };
    }
  };

  // PostMessage endpoint (MyPa can be called when iframed)
  window.addEventListener("message", async (event) => {
    const d = event.data;
    if (!d || d.type !== MYPA_CALL_TYPE) return;

    const call = d.call;
    const requestId = d.requestId;

    try {
      const response = await window.mypa_call(call);
      event.source?.postMessage(
        { type: MYPA_RESPONSE_TYPE, requestId, response },
        event.origin || "*"
      );
    } catch (err) {
      console.error("[MYPA_BRIDGE] error:", err);
    }
  });

  // ------------------------------
  // DOMContentLoaded wiring
  // ------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    // Load sites then init
    mergeAuthorizedSites().then((sites) => initializeAuthorizedSites(sites));

    // Sidebar layout buttons (ONLY buttons with data-screens)
    document.querySelectorAll(".sidebar button[data-screens]").forEach((button) => {
      button.addEventListener("click", function () {
        const n = parseInt(this.getAttribute("data-screens"), 10);
        if (!isAllowedCount(n)) {
          alert("Not allowed: " + n);
          return;
        }
        createScreens(n);
      });
    });

    // Clear cache
    const clearCacheButton = document.getElementById("clear-cache-btn");
    if (clearCacheButton) {
      clearCacheButton.addEventListener("click", clearCache);
    }

    // Mobile scroll buttons
    const scrollUpBtn = document.getElementById("scroll-up");
    const scrollDownBtn = document.getElementById("scroll-down");
    if (scrollUpBtn && scrollDownBtn) {
      scrollUpBtn.addEventListener("click", scrollToPreviousScreen);
      scrollDownBtn.addEventListener("click", scrollToNextScreen);
    }

    // Service worker
    registerServiceWorker();
  });
})();
