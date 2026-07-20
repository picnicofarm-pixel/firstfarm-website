const owner = process.env.GITHUB_OWNER || 'picnicofarm-pixel';
const repo = process.env.GITHUB_REPO || 'firstfarm-website';
const branch = process.env.GITHUB_BRANCH || 'main';
const filePath = 'public/site-content.json';

function jsonResponse(response, status, data) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function encodeBase64(value) {
  return Buffer.from(JSON.stringify(value, null, 2), 'utf8').toString('base64');
}

async function github(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'firstfarm-admin',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `GitHub API ${response.status}`);
  return body;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return jsonResponse(response, 405, {error: 'POST만 사용할 수 있습니다.'});
  }

  if (!process.env.GITHUB_TOKEN) {
    return jsonResponse(response, 500, {error: 'Vercel 환경변수 GITHUB_TOKEN이 필요합니다.'});
  }

  if (process.env.ADMIN_PASSWORD && request.body?.password !== process.env.ADMIN_PASSWORD) {
    return jsonResponse(response, 401, {error: '관리자 비밀번호가 올바르지 않습니다.'});
  }

  const content = request.body?.content;
  if (!content?.pages || !content?.seo || !content?.theme) {
    return jsonResponse(response, 400, {error: '게시할 홈페이지 데이터가 올바르지 않습니다.'});
  }

  try {
    const current = await github(`/contents/${filePath}?ref=${branch}`);
    const result = await github(`/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Update website content from admin',
        content: encodeBase64(content),
        sha: current.sha,
        branch
      })
    });
    return jsonResponse(response, 200, {
      ok: true,
      commit: result.commit?.sha,
      message: 'GitHub에 저장했습니다. Vercel이 자동으로 재배포합니다.'
    });
  } catch (error) {
    return jsonResponse(response, 500, {error: error.message});
  }
}
