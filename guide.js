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

// ✅ RAW_BASE 搭配上方設定，可組合出實際的 GitHub 資料夾網址，例如：
//    https://raw.githubusercontent.com/<owner>/<repo>/<branch>/guides/<檔案>.md
const RAW_BASE = "https://raw.githubusercontent.com";

const titleElement = document.getElementById("guide-title");
const contentElement = document.getElementById("guide-content");

bootstrap();

async function bootstrap() {
  const fileName = readFileName();
  if (!fileName) {
    return;
  }

  const displayName = toDisplayName(fileName);
  document.title = `${displayName} | 角色攻略`;
  titleElement.textContent = displayName;

  try {
    const markdown = await fetchGuideMarkdown(fileName);
    renderGuide(markdown);
  } catch (error) {
    console.error("[guide-page] 無法載入攻略：", error);
    renderError("很抱歉，目前無法載入此攻略。請確認檔案是否存在，或稍候再試。");
  }
}

function readFileName() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");

  if (!name) {
    renderError("缺少攻略檔案名稱參數。請從首頁重新選擇角色。");
    return null;
  }

  if (!CONFIG.owner || !CONFIG.repo || CONFIG.owner === "YOUR_GITHUB_OWNER" || CONFIG.repo === "YOUR_REPO_NAME") {
    renderError("請先設定正確的 GitHub 擁有者與 Repository 名稱。");
    return null;
  }

  return name;
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

function renderGuide(markdown) {
  contentElement.classList.remove("guide-loading");
  contentElement.innerHTML = marked.parse(markdown, { mangle: false, headerIds: true });
}

function renderError(message) {
  contentElement.className = "guide-content guide-error";
  contentElement.textContent = message;
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

