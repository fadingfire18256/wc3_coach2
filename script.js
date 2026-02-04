const DEFAULT_CONFIG = {
  // ✅ 在此填入 GitHub 擁有者（使用者或組織）名稱，例如 "my-org"
  owner: "fadingfire18256",
  // ✅ 在此填入 Repository 名稱，例如 "my-guides-site"
  repo: "wc3_coach2",
  branch: "main",
  guidesDir: "guides",
  token: undefined
};

const CONFIG = Object.freeze(
  Object.assign(
    {},
    DEFAULT_CONFIG,
    window.GUIDE_SITE_CONFIG ?? {},
    {
      owner: resolveOwner(window.GUIDE_SITE_CONFIG?.owner ?? DEFAULT_CONFIG.owner),
      repo: resolveRepo(window.GUIDE_SITE_CONFIG?.repo ?? DEFAULT_CONFIG.repo)
    }
  )
);

const API_BASE = "https://api.github.com";
// ✅ 若想改用自訂分支或資料夾，可延伸下列 RAW_BASE 與 guidesDir 的設定組合，產生完整的 GitHub 資料夾網址
const RAW_BASE = "https://raw.githubusercontent.com";

const searchInput = document.getElementById("search");
const statusElement = document.getElementById("status");
const listElement = document.getElementById("character-list");

let characters = [];
let selectedRoles = new Set();

bootstrap();

async function bootstrap() {
  if (!CONFIG.owner || !CONFIG.repo || CONFIG.owner === "YOUR_GITHUB_OWNER" || CONFIG.repo === "YOUR_REPO_NAME") {
    renderStatus(
      "請在 script.js 或 window.GUIDE_SITE_CONFIG 中設定有效的 GitHub 擁有者與 Repository 名稱。",
      "error"
    );
    return;
  }

  const addGuideBtn = document.getElementById("add-guide-btn");
  if (addGuideBtn) {
    addGuideBtn.href = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/tree/${CONFIG.branch}/${CONFIG.guidesDir}`;
  }

  const copyTemplateBtn = document.getElementById("copy-template-btn");
  if (copyTemplateBtn) {
    copyTemplateBtn.addEventListener("click", handleCopyTemplate);
  }

  searchInput.disabled = true;

  try {
    const files = await fetchGuideIndex();
    if (!files.length) {
      renderStatus("目前沒有任何攻略檔案，請在 guides/ 目錄下新增 Markdown。", "info");
      return;
    }

    characters = await hydrateCharacters(files);
    renderStatus("");
    renderFilters(characters);
    renderCharacters(characters);

    searchInput.disabled = false;
    searchInput.addEventListener("input", handleSearch);
  } catch (error) {
    console.error("[guide-site] 無法載入攻略列表：", error);
    renderStatus("載入攻略資料時發生錯誤，請稍候再試或檢查 GitHub API 設定。", "error");
  }
}

async function fetchGuideIndex() {
  const url = `${API_BASE}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${CONFIG.guidesDir}`;
  const response = await fetch(url, buildRequestOptions());

  if (!response.ok) {
    throw new Error(`GitHub API 回應狀態碼 ${response.status}`);
  }

  const items = await response.json();
  return items
    .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".md") && !item.name.startsWith("_"))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
}

async function hydrateCharacters(files) {
  const settled = await Promise.allSettled(
    files.map(async (file) => {
      const markdown = await fetchGuideMarkdown(file.name);
      const videoUrl = extractFirstHttp(markdown);
      return {
        fileName: file.name,
        displayName: toDisplayName(file.name),
        markdown,
        videoUrl,
        roles: extractRoles(markdown)
      };
    })
  );

  return settled
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .concat(
      settled
        .filter((result) => result.status === "rejected")
        .map((_, index) => ({
          fileName: files[index].name,
          displayName: toDisplayName(files[index].name),
          markdown: "",
          videoUrl: null,
          roles: ["萬能"]
        }))
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-Hant"));
}

function renderCharacters(source, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = source.filter((item) => {
    const matchQuery = !normalizedQuery || item.displayName.toLowerCase().includes(normalizedQuery);
    const matchRole = selectedRoles.size === 0 || item.roles.some((r) => selectedRoles.has(r));
    return matchQuery && matchRole;
  });

  listElement.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>查無結果</strong>請確認輸入的角色名稱或新增新的攻略檔案。";
    listElement.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach((character) => {
    fragment.appendChild(createCharacterCard(character));
  });

  listElement.append(fragment);
}

function createCharacterCard(character) {
  const card = document.createElement("article");
  card.className = "character-card";

  const header = document.createElement("div");
  header.className = "character-card__header";

  const name = document.createElement("div");
  name.className = "character-card__name";
  name.textContent = character.displayName;

  const actions = document.createElement("div");
  actions.className = "character-card__actions";

  const detailLink = document.createElement("a");
  detailLink.className = "character-card__link";
  detailLink.href = `guide.html?name=${encodeURIComponent(character.fileName)}`;
  detailLink.textContent = "查看攻略";

  actions.append(detailLink);

  if (character.videoUrl) {
    const videoLink = document.createElement("a");
    videoLink.className = "character-card__video";
    videoLink.href = character.videoUrl;
    videoLink.target = "_blank";
    videoLink.rel = "noopener noreferrer";
    videoLink.setAttribute("aria-label", `${character.displayName} 的攻略影片`);
    videoLink.textContent = "🎬";
    actions.append(videoLink);
  }

  header.append(name, actions);
  card.append(header);

  return card;
}

function handleSearch(event) {
  const query = event.target.value ?? "";
  renderCharacters(characters, query);
}

async function handleCopyTemplate() {
  const btn = document.getElementById("copy-template-btn");
  try {
    const template = await fetchGuideMarkdown("_template.md");

    // HTTPS 用 navigator.clipboard，HTTP（localhost）用 textarea + execCommand
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(template);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = template;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    btn.textContent = "複製完成！";
    btn.classList.add("btn-copy-template--success");
  } catch (err) {
    console.error("[copy-template]", err);
    btn.textContent = "複製失敗";
  }
  setTimeout(() => {
    btn.textContent = "複製模板";
    btn.classList.remove("btn-copy-template--success");
  }, 1500);
}

function renderStatus(message, type = "info") {
  if (!statusElement) {
    return;
  }

  const normalizedMessage = message.trim();
  statusElement.textContent = normalizedMessage;
  statusElement.classList.remove("status--info", "status--error");

  if (!normalizedMessage) {
    statusElement.style.display = "none";
    return;
  }

  statusElement.style.display = "block";
  statusElement.classList.add(type === "error" ? "status--error" : "status--info");
}

async function fetchGuideMarkdown(fileName) {
  const url = `${RAW_BASE}/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}/${CONFIG.guidesDir}/${encodeURIComponent(
    fileName
  )}`.replace(/%2F/g, "/");

  const response = await fetch(url, buildRequestOptions());
  if (!response.ok) {
    throw new Error(`Raw 檔案載入失敗：${response.status}`);
  }
  return response.text();
}

// 從 markdown 提取「角色定位」後面的詞，無定位時回傳 ["萬能"]
function extractRoles(markdown) {
  if (!markdown) return ["萬能"];
  const match = markdown.match(/\*{0,2}角色定位\*{0,2}\s*[:：]\s*(.+)/);
  if (!match) return ["萬能"];
  const roles = match[1].split(/[/、]/).map((r) => r.trim()).filter(Boolean);
  return roles.length ? roles : ["萬能"];
}

// 從所有角色裡收集不重複的定位詞，動態生成勾選按鈕
function renderFilters(chars) {
  const container = document.getElementById("role-filters");
  if (!container) return;

  // 收集所有定位詞，保持順序：萬能放最後
  const roleSet = new Set();
  chars.forEach((c) => c.roles.forEach((r) => roleSet.add(r)));
  const roles = [...roleSet].sort((a, b) => {
    if (a === "萬能") return 1;
    if (b === "萬能") return -1;
    return a.localeCompare(b, "zh-Hant");
  });

  container.innerHTML = "";
  roles.forEach((role) => {
    const btn = document.createElement("button");
    btn.className = "role-filter";
    btn.textContent = role;
    btn.addEventListener("click", () => {
      if (selectedRoles.has(role)) {
        selectedRoles.delete(role);
        btn.classList.remove("role-filter--active");
      } else {
        selectedRoles.add(role);
        btn.classList.add("role-filter--active");
      }
      renderCharacters(characters, searchInput.value);
    });
    container.append(btn);
  });
}

function extractFirstHttp(markdown) {
  if (!markdown) {
    return null;
  }

  const match = markdown.match(/https?:\/\/[^\s)>\]]+/i);
  return match ? sanitizeUrl(match[0]) : null;
}

function sanitizeUrl(url) {
  try {
    const candidate = new URL(url);
    return candidate.href;
  } catch {
    return null;
  }
}

function toDisplayName(fileName) {
  return decodeURIComponent(fileName)
    .replace(/\.md$/i, "")
    .replace(/[-_]/g, " ");
}

function buildRequestOptions() {
  if (!CONFIG.token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${CONFIG.token}`,
      Accept: "application/vnd.github+json"
    }
  };
}

function resolveOwner(value) {
  if (value && value !== "YOUR_GITHUB_OWNER") {
    return value;
  }

  const [maybeOwner, second, third] = window.location.hostname.split(".");
  if (second === "github" && third === "io" && maybeOwner) {
    return maybeOwner;
  }
  return value;
}

function resolveRepo(value) {
  if (value && value !== "YOUR_REPO_NAME") {
    return value;
  }

  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  if (pathSegments.length > 0) {
    return pathSegments[0];
  }
  return value;
}
