# AGENTS.md — Console Admin Design System

AI 에이전트·기여자의 진입점. **컴포넌트를 추가·수정하기 전에 이 파일을 읽으세요.** 이 시스템은 정적(빌드 없음) vanilla HTML/CSS/JS입니다.

## 절대 규칙 (위반 = 리뷰 반려)

1. **색·크기·간격은 100% 토큰 참조.** 하드코딩 `#hex`·`px` 금지. (예외: 토큰 자체를 정의하는 `foundation.css`, 그리고 화이트 노브/툴팁처럼 스니펫에 명시된 극소수.)
2. **컴포넌트 CSS는 `--sys-accent-*`만 쓴다.** `indigo`·`--ref-indigo-*` 같은 특정 색 직접 참조 금지 (원칙 03).
3. **12px 미만 텍스트 금지.** 본문 기본 `--text-body-md`(14px), 하한 `--text-caption`(12px).
4. **모든 인터랙티브 요소는 4상태 + 포커스 링.** `hover · focus-visible · active · disabled` 전부 정의, `:focus-visible`로 `--sys-border-focus` 3px 링 유지. `outline:none` 후 대체 없음 금지.
5. **데이터 화면은 loading·empty·error 를 반드시 그린다.** (Skeleton · Empty State · Error State)
6. **색만으로 상태 전달 금지.** 배지·상태는 색 + 텍스트/아이콘 이중.
7. **다국어 규칙:** 제품 UI 텍스트는 한국어, 토큰·클래스·코드·주석 식별자는 영문.

머지 전 [리뷰 체크리스트](#리뷰-체크리스트)를 통과시키세요.

## 파일 지도

| 파일 | 역할 | 편집 시 |
|------|------|--------|
| `assets/css/foundation.css` | 토큰(ref/sys) · 5색 프로필 · reset | 값 바꾸면 `tokens/*.json`도 함께 갱신 |
| `assets/css/components.css` | 46개 컴포넌트, `ads-` 접두사 | 새 컴포넌트는 해당 군 주석 아래 추가 |
| `assets/js/app.js` | 테마/accent/density + 오버레이·팝오버·탭 동작 | 이벤트 위임 패턴 유지 |
| `index.html` | 데모 카탈로그 | 새 컴포넌트는 `.spec` 카드로 전 변형·전 상태 노출 |
| `tokens/*.json` | 토큰의 기계 판독 미러 | 단일 진실 원천은 `foundation.css` |

## 토큰 인덱스 (`--sys-*` — UI가 참조하는 계층)

- **background** — `canvas · surface · raised · sunken · hover · overlay`
- **content** — `primary · secondary · tertiary · disabled · inverse · accent · on-accent`
- **border** — `subtle · default · strong · focus`
- **accent** — `solid · hover · active · subtle · muted · content · on-solid` *(← [data-accent]로 교체되는 유일한 그룹)*
- **status** — `success · warning · danger · info` × `{· · -subtle · -content}`
- **typography** — `--text-{display,heading-xl…sm,body-lg…sm,label-lg…sm,caption,code,overline}`
- **space** — `--space-50 … --space-1200` (4px 그리드)
- **radius** — `none · xs · sm · md · lg · xl · 2xl · pill`
- **shadow** — `xs · sm · md · lg · xl` · **z** — `base … tooltip` · **duration/ease** · **layout** · **viz** (`--viz-1…8 · grid · axis`)

버튼 반경은 `md`, 카드 반경은 `lg`로 통일. 차트 색은 `--viz-*`만.

## 컴포넌트 인덱스 (46종 · `ads-` 접두사)

**레이아웃·내비 (01–08):** `ads-shell` · `ads-nav` · `ads-topbar-inner` · `ads-breadcrumb` · `ads-page-header` · `ads-tabs` · `ads-pagination` · `ads-cmdk`
**폼·입력 (09–20):** `ads-btn` · `ads-input` · `ads-textarea` · `ads-select` · `ads-combobox` · `ads-datepicker` · `ads-checkbox` · `ads-radio` · `ads-switch` · `ads-dropzone` · `ads-field` · `ads-slider`
**데이터 표시 (21–32):** `ads-table` · `ads-card` · `ads-stat` · `ads-badge` · `ads-tag` · `ads-avatar` · `ads-desc` · `ads-tooltip` · `ads-chart` · `ads-list` · `ads-tree` · `ads-toolbar`
**피드백·오버레이 (33–42):** `ads-modal` · `ads-drawer` · `ads-toast` · `ads-alert` · `ads-menu` · `ads-progress`/`ads-spinner` · `ads-skel` · `ads-empty` · `ads-popover` · (error = `ads-empty` 재사용)
**유틸·어드민 (43–46):** `ads-divider` · `ads-search` · `ads-matrix` · `ads-timeline`

## 새 컴포넌트 추가 절차

1. `components.css`의 해당 군 주석 블록 아래에 `.ads-<name>` 규칙 추가 — **토큰만** 사용.
2. 4상태 + `:focus-visible` 링 + (해당 시) loading/empty/error 정의.
3. `index.html`에 `.spec` 카드를 만들어 전 변형·전 상태를 라이브로 노출.
4. 상호작용이 있으면 `app.js`에 이벤트 위임 핸들러 추가 (전역 리스너에 분기).
5. 접근성: 시맨틱 태그 + 필요한 `aria-*`, 키보드 흐름(Tab·Esc·화살표) 검증.
6. 5색 × Light/Dark 에서 대비·여백이 무너지지 않는지 확인.

## 안티디자인 규정 (요약 — 생성형 결과의 나쁜 습관 차단)

- **A 타이포:** 11px 이하 금지 · letter-spacing 본문 금지 · 크기 위계 3~4단계
- **B 아이콘:** 의미 있을 때만 · 단일 패밀리·단일 스트로크 · 아이콘 전용 버튼엔 `aria-label` · 이모지를 UI 아이콘으로 금지
- **C 여백:** `--space-*`(4px 그리드)만 · 카드 16~24px · 섹션 24~32px · 선보다 간격 우선
- **D 색:** 한 번에 하나의 accent · accent 면적 ~10% 이하 · 상태색은 상태에만 · 2색 그라데이션 금지(솔리드 우선)
- **E 폰트:** Pretendard 1벌 + JetBrains Mono 1벌 · 굵기 400/600/700 · ALL CAPS는 overline에만
- **F 일관성:** 같은 것은 같게 · 재사용 · 한 화면 1차 버튼 하나
- **G 상태:** 4상태 + 포커스 링 · loading/empty/error 필수

## 리뷰 체크리스트

- [ ] 12px 미만 텍스트가 없는가? 본문은 14px인가?
- [ ] 의미 없는 장식 아이콘은 없는가? 아이콘 전용 버튼에 `aria-label`이 있는가?
- [ ] 간격이 `--space-*`(4px 그리드)만 쓰는가? 임의 px 패딩은 없는가?
- [ ] 화면의 accent는 하나인가? 상태색을 장식으로 쓰지 않았는가?
- [ ] hex/px 하드코딩 없이 100% 토큰 참조인가?
- [ ] `hover · focus-visible · active · disabled` 4상태가 모두 있는가? 포커스 링을 지우지 않았는가?
- [ ] 데이터 화면에 loading(Skeleton) · empty(Empty State) · error가 있는가?
- [ ] Light/Dark, 5개 accent 모두에서 대비가 무너지지 않는가?
