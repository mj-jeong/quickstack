# QuickStack — Release Strategy

> npm 배포 및 사용자 공개를 위한 전략
> Date: 2026-04-13

---

## 1. 패키지 이름

| 항목 | 값 |
|------|-----|
| **Package name** | `create-qstack` |
| **Binary** | `quickstack` |
| **npm create 관례** | `npm create qstack` = `npx create-qstack` |

- `@quickstack/cli` → org `quickstack` 점유로 불가
- `quickstack-cli` → 다른 프로젝트가 점유
- `create-qstack` → 사용 가능 ✅, `npm create` 관례 활용

---

## 2. 사용자 실행 방법

```bash
# npm create 관례 (권장)
npm create qstack

# pnpm
pnpm create qstack

# yarn
yarn create qstack

# npx 직접
npx create-qstack

# dry-run
npm create qstack -- --dry-run

# 전역 설치 후
npm install -g create-qstack
quickstack create
```

---

## 3. 배포 전 체크리스트

- [x] README.md 작성
- [x] LICENSE 파일 (MIT)
- [x] package.json 보완 (license, repository, homepage, keywords, publishConfig)
- [x] publint 통과
- [ ] npm login
- [ ] npm publish
- [ ] 배포 확인: `npx create-qstack --version`

---

## 4. 배포 절차

```bash
# 1. 빌드 + 검증
pnpm build
pnpm dlx publint
pnpm test:unit
pnpm test:integration

# 2. 배포 (unscoped — access public 불필요, publishConfig에 설정됨)
npm publish

# 3. 확인
npm view create-qstack
npx create-qstack --version
```

---

## 5. 버전 전략

수동 릴리즈 (MVP):

```bash
npm version patch    # 0.1.0 → 0.1.1
npm publish
git push --follow-tags
```

| 범위 | 의미 |
|------|------|
| `0.1.x` | MVP — 초기 피드백 수집, 버그 수정 |
| `0.2.0` | 기능 추가 (새 라이브러리, 새 preset) |
| `1.0.0` | 안정판 — CLI 인터페이스 확정 |

---

## 6. 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| Node 22 미만 사용자 | README에 요구사항 명시. engines 필드가 npm install 시 경고 |
| CNA 버전 변경 | fixture refresh CI가 감지 + PR 생성 |
| npm publish 실수 | publishConfig.access 설정됨. prepublishOnly로 빌드+publint 자동 |
