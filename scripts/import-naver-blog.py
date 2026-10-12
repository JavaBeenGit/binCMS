#!/usr/bin/env python3
"""
네이버 블로그 → 인테리어 갤러리 이관 도구 (재실행 가능).

사용법 (백엔드가 떠 있어야 한다):
  python scripts/import-naver-blog.py                      # 전량 이관 (localhost:8080, admin/1234)
  python scripts/import-naver-blog.py --dry-run            # API 호출 없이 변환 결과만 .blog-cache/<blog>/converted/ 에 저장
  python scripts/import-naver-blog.py --limit 3            # 최신 3건만
  python scripts/import-naver-blog.py --only 224153281133  # 특정 글만
  python scripts/import-naver-blog.py --base-url https://example.com --admin-password '...'   # 운영

동작:
  1. PostTitleListAsync 로 글 목록(제목·카테고리번호·날짜)을 전부 가져온다. 카테고리 이름은 RSS 로 보강한다.
  2. 글마다 모바일 페이지(m.blog.naver.com)의 se-main-container 를 컴포넌트 단위로 HTML 로 변환한다.
     이미지는 ?type=w966 으로 내려받아 /api/v1/user/files/upload 로 올리고 본문의 <img> 를 /uploads/... 로 바꾼다.
  3. 본문 맨 앞에 <!--naver-log:{logNo}--> 마커를 넣고, 기존 글(마커 일치)이 있으면 PUT 으로 갱신, 없으면 POST 로 생성한다.
     → CATEGORY_MAP 을 바꿔 다시 돌리면 카테고리가 갱신된다. 중복 글은 생기지 않는다.
  4. 받은 HTML·이미지와 업로드 결과는 .blog-cache/ 에 캐시한다(git 제외).

의존성: Python 3.10+ 와 lxml (pip install lxml). 그 외는 표준 라이브러리.
"""
from __future__ import annotations

import argparse
import hashlib
import html as html_mod
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

try:
    from lxml import html as lxml_html
except ImportError:  # pragma: no cover
    sys.exit("lxml 이 필요합니다: pip install lxml")

# ----------------------------------------------------------------------------
# 설정
# ----------------------------------------------------------------------------

# 블로그 카테고리 이름 → 갤러리 카테고리. 사용자 확인 후 바꾸면 재실행으로 반영된다.
CATEGORY_MAP = {
    "현장시공": "ONSITE",
    "셀프시공 해보기": "SELF_TIP",
    "공구/자재": "SELF_TIP",
    "인테리어스토리": "STORY",
    "IOT(사물인터넷)": "STORY",
    "스케치업 공부일지": "STORY",
}
DEFAULT_CATEGORY = "STORY"

# RSS 에 없는(오래된) 글을 위한 categoryNo → 이름 예비 표 (2026-10-12 willer8046 기준)
CATEGORY_NO_NAME = {"6": "현장시공", "7": "인테리어스토리", "8": "공구/자재", "14": "셀프시공 해보기",
                    "12": "IOT(사물인터넷)", "9": "스케치업 공부일지"}

IMAGE_TYPE_PARAM = "w966"          # 네이버 썸네일 서버가 허용하는 큰 사이즈
REQUEST_DELAY = 0.3                # 블로그 서버 예의
UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
INLINE_KEEP = {"b", "strong", "i", "em", "u", "s", "a", "br"}

MARKER_RE = re.compile(r"<!--naver-log:(\d+)-->")


def log(msg: str) -> None:
    print(msg, flush=True)


# Windows 콘솔(cp949)에서도 한글·특수문자가 깨지지 않게
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:  # pragma: no cover
        pass


# ----------------------------------------------------------------------------
# HTTP
# ----------------------------------------------------------------------------

def http_get(url: str, headers: dict | None = None, retries: int = 3) -> bytes:
    hdrs = {"User-Agent": UA}
    if headers:
        hdrs.update(headers)
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=hdrs)
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            time.sleep(REQUEST_DELAY)
            return data
        except (urllib.error.URLError, TimeoutError) as e:  # pragma: no cover
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"GET 실패: {url}: {last}")


def http_json(method: str, url: str, body: dict | None = None, token: str | None = None) -> dict:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    hdrs = {"Content-Type": "application/json; charset=utf-8", "Accept": "application/json"}
    if token:
        hdrs["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {url} → {e.code}: {e.read().decode('utf-8', 'replace')[:300]}") from e


def http_multipart(url: str, fields: dict, file_field: str, filename: str, content: bytes, token: str) -> dict:
    boundary = "----bincms" + uuid.uuid4().hex
    ctype = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    parts: list[bytes] = []
    for k, v in fields.items():
        parts.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n").encode("utf-8"))
    parts.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"{file_field}\"; filename=\"{filename}\"\r\n"
                  f"Content-Type: {ctype}\r\n\r\n").encode("utf-8"))
    parts.append(content)
    parts.append(f"\r\n--{boundary}--\r\n".encode("utf-8"))
    body = b"".join(parts)
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"UPLOAD {filename} → {e.code}: {e.read().decode('utf-8', 'replace')[:300]}") from e


# ----------------------------------------------------------------------------
# binCms API
# ----------------------------------------------------------------------------

class Api:
    def __init__(self, base_url: str, login_id: str, password: str):
        self.base = base_url.rstrip("/")
        res = http_json("POST", f"{self.base}/api/v1/auth/login", {"loginId": login_id, "password": password})
        if not res.get("success"):
            raise RuntimeError(f"로그인 실패: {res}")
        self.token = res["data"]["accessToken"]
        role = res["data"]["member"].get("roleCode")
        if not role or not role.endswith("ADMIN"):
            raise RuntimeError(f"관리자 계정이 아닙니다: {role}")

    def upload(self, filename: str, content: bytes) -> dict:
        res = http_multipart(f"{self.base}/api/v1/user/files/upload", {"refType": "INTERIOR", "refId": "0"},
                             "file", filename, content, self.token)
        if not res.get("success"):
            raise RuntimeError(f"업로드 실패: {res}")
        return res["data"]

    def existing_by_marker(self) -> dict[str, int]:
        """기존 인테리어 글 전체를 훑어 마커(logNo) → id 를 만든다."""
        found: dict[str, int] = {}
        page = 0
        while True:
            res = http_json("GET", f"{self.base}/api/v1/admin/interiors?page={page}&size=100&sort=id,asc", token=self.token)
            data = res["data"]
            for item in data.get("content", []):
                m = MARKER_RE.search(item.get("content") or "")
                if m:
                    found[m.group(1)] = item["id"]
            if data.get("last", True) or page >= int(data.get("totalPages", 1)) - 1:
                break
            page += 1
        return found

    def create(self, payload: dict) -> int:
        res = http_json("POST", f"{self.base}/api/v1/admin/interiors", payload, self.token)
        return res["data"]["id"]

    def update(self, iid: int, payload: dict) -> None:
        http_json("PUT", f"{self.base}/api/v1/admin/interiors/{iid}", payload, self.token)


# ----------------------------------------------------------------------------
# 네이버 블로그
# ----------------------------------------------------------------------------

def fetch_post_list(blog_id: str, cache: Path) -> list[dict]:
    posts: list[dict] = []
    page = 1
    total = None
    while True:
        url = f"https://blog.naver.com/PostTitleListAsync.naver?blogId={blog_id}&currentPage={page}&countPerPage=30"
        raw = http_get(url).decode("utf-8", "replace")
        if total is None:
            m = re.search(r'"totalCount":"?(\d+)', raw)
            total = int(m.group(1)) if m else 0
        batch = re.findall(r'"logNo":"(\d+)","title":"([^"]*)","categoryNo":"(\d+)","parentCategoryNo":"(\d+)".*?"addDate":"([^"]*)"', raw)
        for log_no, title, cat_no, _parent, add_date in batch:
            posts.append({"logNo": log_no, "title": urllib.parse.unquote_plus(title), "categoryNo": cat_no,
                          "addDate": add_date.strip()})
        if not batch or len(posts) >= total:
            break
        page += 1
    # 카테고리 이름: RSS(최근 50건)로 보강, 없으면 예비 표
    names = dict(CATEGORY_NO_NAME)
    try:
        rss = http_get(f"https://rss.blog.naver.com/{blog_id}.xml").decode("utf-8", "replace")
        by_log = {}
        for item in re.findall(r"<item>(.*?)</item>", rss, re.S):
            lm = re.search(rf"{blog_id}/(\d+)", item)
            cm = re.search(r"<category><!\[CDATA\[(.*?)\]\]>", item)
            if lm and cm:
                by_log[lm.group(1)] = html_mod.unescape(cm.group(1)).replace("\xa0", " ").strip()
        for p in posts:
            if p["logNo"] in by_log:
                names.setdefault(p["categoryNo"], by_log[p["logNo"]])
                names[p["categoryNo"]] = by_log[p["logNo"]]
    except Exception as e:  # pragma: no cover
        log(f"[warn] RSS 읽기 실패, 예비 카테고리 표 사용: {e}")
    for p in posts:
        p["category"] = names.get(p["categoryNo"], f"?{p['categoryNo']}")
    (cache / "post-list.json").write_text(json.dumps(posts, ensure_ascii=False, indent=1), encoding="utf-8")
    return posts


def fetch_post_html(blog_id: str, log_no: str, cache: Path) -> str:
    fn = cache / "posts" / f"{log_no}.html"
    if fn.exists():
        return fn.read_text(encoding="utf-8", errors="ignore")
    data = http_get(f"https://m.blog.naver.com/{blog_id}/{log_no}")
    fn.parent.mkdir(parents=True, exist_ok=True)
    fn.write_bytes(data)
    return data.decode("utf-8", "ignore")


# ----------------------------------------------------------------------------
# 변환
# ----------------------------------------------------------------------------

class Converter:
    def __init__(self, api: Api | None, cache: Path, log_no: str):
        self.api = api
        self.cache = cache
        self.log_no = log_no
        self.images: list[str] = []          # 업로드된 이미지 URL (순서대로)
        self.thumbs: list[str] = []          # 같은 순서의 썸네일 URL
        self.skipped: list[str] = []
        self.uploaded_index_path = cache / "uploaded.json"
        self.uploaded: dict[str, dict] = {}
        if self.uploaded_index_path.exists():
            self.uploaded = json.loads(self.uploaded_index_path.read_text(encoding="utf-8"))

    # ---- 이미지 ----
    def image_url(self, img) -> str | None:
        src = img.get("data-lazy-src") or img.get("src") or ""
        if not src or "pstatic.net" not in src:
            return None
        base = src.split("?")[0]
        return f"{base}?type={IMAGE_TYPE_PARAM}"

    def handle_image(self, img) -> str | None:
        url = self.image_url(img)
        if not url:
            return None
        if self.api is None:                      # dry-run: 원본 URL 유지
            self.images.append(url)
            return url
        if url in self.uploaded:
            info = self.uploaded[url]
        else:
            base = url.split("?")[0]
            name = urllib.parse.unquote(base.rsplit("/", 1)[-1]) or "image"
            if "." not in name:
                name += ".jpg"
            key = hashlib.sha1(url.encode()).hexdigest()[:16]
            local = self.cache / "images" / f"{key}_{re.sub(r'[^A-Za-z0-9._-]', '_', name)}"
            local.parent.mkdir(parents=True, exist_ok=True)
            if not local.exists():
                local.write_bytes(http_get(url, headers={"Referer": "https://m.blog.naver.com/"}))
            info = self.api.upload(local.name.split("_", 1)[-1], local.read_bytes())
            self.uploaded[url] = info
            self.uploaded_index_path.write_text(json.dumps(self.uploaded, ensure_ascii=False, indent=1), encoding="utf-8")
        file_url = info.get("fileUrl") or info.get("url")
        self.images.append(file_url)
        self.thumbs.append(info.get("thumbnailUrl") or file_url)   # 갤러리 썸네일은 작은 쪽을 쓴다
        return file_url

    def figure(self, img, caption: str = "") -> str:
        url = self.handle_image(img)
        if not url:
            return ""
        cap = f"<figcaption>{html_mod.escape(caption)}</figcaption>" if caption else ""
        return f'<figure class="image"><img src="{html_mod.escape(url)}" alt=""></figure>{cap}'

    # ---- 텍스트 ----
    def inline(self, node) -> str:
        """허용 인라인 태그만 남기고 직렬화. 이미지는 업로드해서 <img>."""
        out: list[str] = []
        if node.text:
            out.append(html_mod.escape(node.text))
        for child in node:
            tag = child.tag if isinstance(child.tag, str) else ""
            if tag == "img":
                url = self.handle_image(child)
                if url:
                    out.append(f'<img src="{html_mod.escape(url)}" alt="">')
            elif tag in INLINE_KEEP:
                if tag == "br":
                    out.append("<br>")
                elif tag == "a":
                    href = child.get("href") or ""
                    if href and not href.startswith("#"):
                        out.append(f'<a href="{html_mod.escape(href)}" target="_blank" rel="noopener">{self.inline(child)}</a>')
                    else:
                        out.append(self.inline(child))
                else:
                    out.append(f"<{tag}>{self.inline(child)}</{tag}>")
            else:
                out.append(self.inline(child))
            if child.tail:
                out.append(html_mod.escape(child.tail))
        return "".join(out)

    def paragraphs(self, container) -> list[str]:
        ps: list[str] = []
        for p in container.iter():
            if not isinstance(p.tag, str) or p.tag != "p" or "se-text-paragraph" not in (p.get("class") or ""):
                continue
            body = self.inline(p).replace("​", "").strip()
            cls = p.get("class") or ""
            style = ' style="text-align:center"' if "align-center" in cls else (' style="text-align:right"' if "align-right" in cls else "")
            ps.append(f"<p{style}>{body}</p>" if body else "<p>&nbsp;</p>")
        return ps

    # ---- 컴포넌트 ----
    def component(self, comp) -> list[str]:
        cls = comp.get("class") or ""
        kind = next((c[3:] for c in cls.split() if c.startswith("se-") and c not in ("se-component", "se-l-default")
                     and not c.startswith("se-l-")), "")
        if kind == "text":
            return self.paragraphs(comp)
        if kind in ("image", "imageGroup", "imageStrip"):
            out = []
            for module in comp.iter():
                if isinstance(module.tag, str) and module.tag == "div" and "se-module-image" in (module.get("class") or ""):
                    imgs = [i for i in module.iter("img") if "se-image-resource" in (i.get("class") or "")]
                    for img in imgs:
                        out.append(self.figure(img))
            caps = [c for c in comp.iter() if isinstance(c.tag, str) and "se-caption" in (c.get("class") or "")]
            if caps:
                cap = html_mod.escape(" ".join(caps[0].text_content().split()).replace("​", ""))
                if cap:
                    out.append(f'<p class="caption" style="text-align:center"><small>{cap}</small></p>')
            return out
        if kind == "quotation":
            inner = "".join(self.paragraphs(comp))
            return [f"<blockquote>{inner}</blockquote>"]
        if kind == "horizontalLine":
            return ["<hr>"]
        if kind == "table":
            rows = []
            for tr in comp.iter("tr"):
                cells = []
                for td in tr:
                    if not isinstance(td.tag, str) or td.tag not in ("td", "th"):
                        continue
                    attrs = ""
                    for a in ("colspan", "rowspan"):
                        if td.get(a) and td.get(a) != "1":
                            attrs += f' {a}="{td.get(a)}"'
                    cells.append(f"<td{attrs}>{''.join(self.paragraphs(td)) or '&nbsp;'}</td>")
                rows.append("<tr>" + "".join(cells) + "</tr>")
            return [f'<table class="table"><tbody>{"".join(rows)}</tbody></table>'] if rows else []
        if kind == "placesMap":
            title = comp.xpath(".//*[contains(@class,'se-map-title')]")
            addr = comp.xpath(".//*[contains(@class,'se-map-address')]")
            t = title[0].text_content().strip() if title else ""
            a = addr[0].text_content().strip() if addr else ""
            if t or a:
                return [f'<p class="place">📍 {html_mod.escape(t)}{" · " if t and a else ""}{html_mod.escape(a)}</p>']
            return []
        if kind == "oglink":
            a = comp.xpath(".//a[contains(@class,'se-oglink-info')]")
            t = comp.xpath(".//*[contains(@class,'se-oglink-title')]")
            href = a[0].get("href") if a else ""
            text = t[0].text_content().strip() if t else href
            if href:
                return [f'<p><a href="{html_mod.escape(href)}" target="_blank" rel="noopener">{html_mod.escape(text)}</a></p>']
            return []
        # video, document, sticker, code, file, ... → 원문 안내
        self.skipped.append(kind or cls)
        return [f'<p class="caption"><small>[{html_mod.escape(kind or "컴포넌트")}은(는) 원문에서 확인할 수 있습니다]</small></p>']

    def convert(self, page_html: str, post: dict, blog_id: str) -> str:
        doc = lxml_html.fromstring(page_html)
        containers = doc.xpath("//div[contains(@class,'se-main-container')]")
        if not containers:
            raise RuntimeError("se-main-container 없음 (구 에디터 글?)")
        parts: list[str] = []
        for comp in containers[0].xpath("./div[contains(@class,'se-component')]"):
            parts.extend(self.component(comp))
        # 연속 빈 문단은 하나로
        cleaned: list[str] = []
        for p in parts:
            if p == "<p>&nbsp;</p>" and cleaned and cleaned[-1] == "<p>&nbsp;</p>":
                continue
            cleaned.append(p)
        while cleaned and cleaned[-1] == "<p>&nbsp;</p>":
            cleaned.pop()
        origin = f"https://blog.naver.com/{blog_id}/{post['logNo']}"
        header = (f"<!--naver-log:{post['logNo']}-->"
                  f'<p class="import-source"><small>네이버 블로그 원문 · {html_mod.escape(post["addDate"])} · '
                  f'<a href="{origin}" target="_blank" rel="noopener">원문 보기</a></small></p>')
        return header + "\n" + "\n".join(cleaned)


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------

def parse_date(add_date: str) -> tuple:
    nums = [int(x) for x in re.findall(r"\d+", add_date)]
    return tuple(nums + [0] * (3 - len(nums)))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--base-url", default=os.environ.get("BINCMS_BASE_URL", "http://localhost:8080"))
    ap.add_argument("--admin-id", default=os.environ.get("ADMIN_ID", "admin"))
    ap.add_argument("--admin-password", default=os.environ.get("ADMIN_PASSWORD", "1234"))
    ap.add_argument("--blog-id", default="willer8046")
    ap.add_argument("--limit", type=int, default=0, help="최신 N건만")
    ap.add_argument("--only", action="append", default=[], help="특정 logNo 만 (여러 번 지정 가능)")
    ap.add_argument("--dry-run", action="store_true", help="API 호출 없이 변환 결과만 저장")
    ap.add_argument("--cache-dir", default=".blog-cache")
    args = ap.parse_args()

    cache = Path(args.cache_dir) / args.blog_id
    cache.mkdir(parents=True, exist_ok=True)

    posts = fetch_post_list(args.blog_id, cache)
    log(f"글 목록 {len(posts)}건 (카테고리: {sorted({p['category'] for p in posts})})")
    if args.only:
        posts = [p for p in posts if p["logNo"] in set(args.only)]
    if args.limit:
        posts = posts[: args.limit]
    posts.sort(key=lambda p: (parse_date(p["addDate"]), int(p["logNo"])))   # 오래된 글부터 → 최신 글이 큰 id

    api = None if args.dry_run else Api(args.base_url, args.admin_id, args.admin_password)
    existing = api.existing_by_marker() if api else {}
    log(f"기존 이관 글 {len(existing)}건 발견 (마커 기준)")

    created = updated = failed = 0
    skipped_kinds: dict[str, int] = {}
    for i, post in enumerate(posts, 1):
        log_no = post["logNo"]
        category = CATEGORY_MAP.get(post["category"], DEFAULT_CATEGORY)
        try:
            page = fetch_post_html(args.blog_id, log_no, cache)
            conv = Converter(api, cache, log_no)
            content = conv.convert(page, post, args.blog_id)
            for k in conv.skipped:
                skipped_kinds[k] = skipped_kinds.get(k, 0) + 1
            payload = {"category": category, "title": post["title"][:200], "content": content,
                       "thumbnailUrl": (conv.thumbs or conv.images or [None])[0], "sortOrder": 0}
            if args.dry_run:
                out = cache / "converted" / f"{log_no}.html"
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(f"<!-- {category} | {post['title']} -->\n{content}", encoding="utf-8")
                log(f"[{i}/{len(posts)}] dry {log_no} {category} 이미지 {len(conv.images)} — {post['title'][:40]}")
                continue
            if log_no in existing:
                api.update(existing[log_no], payload)
                updated += 1
                log(f"[{i}/{len(posts)}] 갱신 #{existing[log_no]} {category} 이미지 {len(conv.images)} — {post['title'][:40]}")
            else:
                iid = api.create(payload)
                existing[log_no] = iid
                created += 1
                log(f"[{i}/{len(posts)}] 생성 #{iid} {category} 이미지 {len(conv.images)} — {post['title'][:40]}")
        except Exception as e:  # noqa: BLE001
            failed += 1
            log(f"[{i}/{len(posts)}] 실패 {log_no}: {e}")

    log(f"\n완료: 생성 {created} · 갱신 {updated} · 실패 {failed} · 건너뛴 컴포넌트 {skipped_kinds or '없음'}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
