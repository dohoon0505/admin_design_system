# Console · Admin Design System

**PC 어드민을 위한 독립 디자인 시스템** — 깔끔하고, 밀도 높고, 일관된 콘솔.
`v1.1.0` · 46 컴포넌트 · 3-tier 토큰 · 8색 프로필 × Light/Dark · WCAG 2.2 AA · Toss-inspired 리프레시

빌드가 필요 없는 **정적 사이트**입니다 (vanilla HTML/CSS/JS). `index.html`을 열면 전 컴포넌트를 라이브로 확인할 수 있고, GitHub Pages로 그대로 배포됩니다.

---

## 빠른 시작

로컬에서 보려면 어떤 정적 서버로도 열 수 있습니다(폰트 CDN 때문에 `file://` 보다 `http://` 권장):

```bash
# Python 3
python -m http.server 8080
# 또는 Node
npx serve .
```

브라우저에서 `http://localhost:8080` → 상단 스위처로 **Theme / Accent / Density**를 바꿔 8색 × Light/Dark = 16조합을 눈으로 검증하세요. `examples/dashboard.html`에서 실제 조립 화면(대시보드) 예시도 볼 수 있습니다. `⌘K` / `Ctrl+K`로 커맨드 팔레트가 열립니다.

## 핵심 원리 — 색을 "갈아끼운다"

컴포넌트 CSS는 특정 색(indigo 등)을 **절대 직접 참조하지 않습니다.** 오직 `--sys-accent-*`만 씁니다. 밝기는 `data-theme`, 강조색은 `data-accent`로 **직교(orthogonal)** 제어되므로, 속성 두 개만 바꾸면 컴포넌트 수정 없이 8색 × 2모드가 나옵니다.

```html
<html data-theme="light" data-accent="blue">     <!-- 기본 (토스 블루) -->
<html data-theme="dark"  data-accent="blue">     <!-- 다크 + 블루 -->
```

```js
document.documentElement.dataset.theme  = "dark";  // light | dark
document.documentElement.dataset.accent = "teal";  // indigo | blue | teal | green | amber | rose | violet | neutral
```

사용자 선택값은 `localStorage`에 저장되어 재방문 시 복원됩니다 (`assets/js/app.js`).

## 레포 구조

```
admin_design_system/
├─ index.html                  # 데모 카탈로그 (전 컴포넌트 라이브 미리보기)
├─ assets/
│  ├─ css/
│  │  ├─ foundation.css         # 토큰(ref/sys) · 8색 프로필 · reset · base
│  │  └─ components.css         # 46개 컴포넌트 CSS
│  └─ js/
│     └─ app.js                 # 테마/accent/density 토글 + 컴포넌트 동작
├─ tokens/
│  ├─ reference.json            # --ref-* 원시 팔레트
│  ├─ system.light.json         # --sys-* Light
│  ├─ system.dark.json          # --sys-* Dark
│  └─ profiles.json             # 5 accent 프로필 remap
├─ AGENTS.md                    # AI/기여자 진입점 (토큰·컴포넌트 인덱스, 규칙)
├─ README.md
└─ .github/workflows/pages.yml  # GitHub Pages 자동 배포
```

## 토큰 (3-tier)

| 계층 | 접두사 | 역할 | 직접 사용? |
|------|--------|------|-----------|
| ① 참조 | `--ref-*` | 원시 팔레트 (indigo-600 …) | ✕ (뼈대) |
| ② 시맨틱 | `--sys-*` | 역할별 의미 (accent-solid, content-primary …) | ✓ **UI는 항상 여기만** |
| ③ 컴포넌트 | `--comp-*` | 개별 부품 (필요 시) | 선택 |

`tokens/*.json`은 `foundation.css`의 CSS 변수를 기계가 읽을 수 있게 미러링한 것입니다(Figma·Style Dictionary·문서 자동화용). **단일 진실 원천은 `foundation.css`** 입니다 — 값 변경 시 두 곳을 함께 갱신하세요.

## 컴포넌트 (46종)

| 군 | 컴포넌트 |
|----|---------|
| 레이아웃·내비 | App Shell · Sidebar · Topbar · Breadcrumb · Page Header · Tabs · Pagination · Command Palette |
| 폼·입력 | Button · Text Field · Textarea · Select · Combobox · Date Picker · Checkbox · Radio · Switch · File Upload · Form Field · Slider |
| 데이터 표시 | Data Table · Card · Stat/KPI · Badge · Tag · Avatar · Description List · Tooltip · Charts · List · Tree · Filter Bar |
| 피드백·오버레이 | Modal · Drawer · Toast · Alert · Dropdown Menu · Progress · Skeleton · Empty State · Popover · Error State |
| 유틸·어드민 | Divider · Search Field · Permission Matrix · Timeline |

모든 클래스는 `ads-` 접두사를 씁니다. 마크업·스니펫은 `index.html`을 그대로 복사해 쓰세요.

## GitHub Pages 배포

1. 이 레포를 GitHub에 push.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** 선택.
3. `main`에 push하면 `.github/workflows/pages.yml`이 자동 배포합니다.
   - (액션 대신) *Deploy from a branch → main / (root)* 도 가능 — 빌드가 없으므로 루트를 그대로 서빙합니다.
4. 배포 URL에서 8색 × Light/Dark 대비·여백·상태를 육안 검증하세요.

## 여덟 가지 원칙 (요약)

1. 의미로 부른다, 값으로 부르지 않는다 — `--sys-accent-solid` (not `#4A4FD1`)
2. 하나의 표면, 두 개의 테마 — 같은 토큰, 다른 값
3. Accent는 갈아끼운다 — 컴포넌트는 색을 모른다
4. 축약하지 않는다 — `Button` (not `Btn`)
5. 예외는 시스템 안에서 푼다 — 인라인 스타일로 덮지 않는다
6. 밀도는 어드민의 언어다 — 8px 리듬
7. 모션은 피드백이다 — 짧고(≤240ms) 예측 가능하게
8. 접근성은 기본값이다 — WCAG 2.2 AA, 포커스 링 유지

전체 원칙·안티디자인 규정·리뷰 체크리스트는 [`AGENTS.md`](AGENTS.md) 참고.

## 라이선스

**License-safe.** 폰트는 SIL OFL(Pretendard / JetBrains Mono)만 사용합니다. 특정 상용 디자인 시스템의 토큰·에셋·폰트를 복제하지 않고, 공개적으로 통용되는 원칙(명료함·절제·여백)만 재해석했습니다.
