# QuickStackTool

Next.js 프로젝트를 빠르게 시작하는 CLI 도구.

공식 생성기(`create-next-app`) 위에서 선택형 프리셋과 실무 라이브러리 조합을 한 번에 적용합니다.

## Why QuickStackTool?

새 프로젝트를 시작할 때마다 반복되는 문제들:

- 이전 프로젝트를 복붙해서 시작
- 필요한 설정을 몰라서 빠뜨림
- 매번 같은 라이브러리 설치 + 초기 설정 반복
- 공식 문서와 커뮤니티 관행 사이에서 고민

QuickStackTool은 **몰라서 빠뜨리는 설정**과 **반복적으로 고민하는 초기 선택**을 한 번에 정리합니다.

---

## Quick Start

### 방법 1: 설치 없이 바로 실행 (권장)

```bash
npx quick-stack-tool
```

별도 설치 없이 npm에서 다운로드 → 실행 → 완료 후 자동 제거됩니다.

```bash
# pnpm 사용자
pnpm dlx quick-stack-tool

# yarn 사용자
yarn dlx quick-stack-tool
```

### 방법 2: 전역 설치 후 실행 (반복 사용 시)

```bash
npm install -g quick-stack-tool
```

설치 후 `quickstack` 명령어로 어디서든 실행할 수 있습니다:

```bash
quickstack
```

```bash
# pnpm 전역 설치
pnpm add -g quick-stack-tool

# yarn 전역 설치
yarn global add quick-stack-tool
```

---

## Usage

실행하면 대화형 프롬프트가 시작됩니다:

```
$ npx quick-stack-tool

? Where to set up?
  ○ Create new directory   — 프로젝트명으로 새 폴더를 생성합니다
  ○ Use current directory  — 현재 디렉토리에 직접 세팅합니다

? Project name: my-app
? Package manager: pnpm
? Preset: recommended
? Styling / UI: Recommended All
? Utilities: Recommended All
? State / Form: Recommended All
? Auth: Recommended All
? Database: supabase, Prisma
? Proceed with these settings? Yes

✔ Next.js app created.
✔ Project my-app created successfully!
```

### Setup Mode

| 모드 | 설명 | 사용 예시 |
|------|------|----------|
| **Create new directory** | 현재 위치에 프로젝트명 폴더를 새로 생성 | `cd ~/projects && npx quick-stack-tool` |
| **Use current directory** | 미리 만든 빈 디렉토리에 직접 세팅 | `mkdir my-app && cd my-app && npx quick-stack-tool` |

### Dry Run (미리보기)

실제 파일을 생성하지 않고 설치 계획만 확인:

```bash
npx quick-stack-tool --dry-run

# 전역 설치한 경우
quickstack --dry-run
```

---

## Features

- **2개 프리셋**: minimal (CNA 기본) / recommended (실무 디렉토리 구조)
- **14개 라이브러리** 선택 설치 (5개 그룹)
- **자동 의존 해결**: shadcn 선택 시 Tailwind CSS + lucide-react 자동 포함
- **상호 배타 검증**: Prisma/Drizzle 동시 선택 방지
- **`--dry-run`**: 실행 없이 설치 계획 미리보기
- **README.md / DECISIONS.md 자동 생성**: 선택 이유와 구조를 문서화

---

## Presets

### minimal

`create-next-app` 기본 구조를 유지합니다. 추가 디렉토리 없음.

### recommended

실무에서 자주 사용하는 디렉토리 구조를 포함합니다:

```
src/
  app/
  components/
  features/
  lib/
  hooks/
  styles/
  types/
```

`recommended` 프리셋 선택 시, 각 그룹의 권장 라이브러리가 기본 체크됩니다.

---

## Supported Libraries

### Styling / UI

| 라이브러리 | 설정 수준 |
|-----------|----------|
| Tailwind CSS | CNA가 설치 + 설정 |
| shadcn/ui + lucide-react | `shadcn init` 자동 실행 |
| framer-motion | 설치 |

### Utilities

| 라이브러리 | 설정 수준 |
|-----------|----------|
| zod | 설치 |
| date-fns | 설치 |
| ts-pattern | 설치 |
| es-toolkit | 설치 |

### State / Form

| 라이브러리 | 설정 수준 |
|-----------|----------|
| zustand | 설치 |
| react-hook-form | 설치 |

### Auth

| 라이브러리 | 설정 수준 |
|-----------|----------|
| NextAuth (Auth.js v5) | `src/auth.ts` + route handler + `.env.example` |

### Database

| 라이브러리 | 설정 수준 | 비고 |
|-----------|----------|------|
| Prisma | `prisma/schema.prisma` + client singleton + `.env.example` | ORM (Drizzle과 택 1) |
| Drizzle | `drizzle.config.ts` + client + schema + `.env.example` | ORM (Prisma와 택 1) |
| supabase | `src/lib/supabase/client.ts` + `.env.example` | BaaS (ORM과 함께 사용 가능) |

---

## Generated Files

QuickStackTool이 생성하는 프로젝트에는 다음 문서가 포함됩니다:

- **README.md**: 프로젝트 개요, 실행 방법, 사용된 기술 스택
- **DECISIONS.md**: 각 기술 선택의 출처와 이유 (Official / Community / QuickStackTool)

---

## How It Works

```
npx quick-stack-tool
        │
        ├─ 1. Setup mode 선택 (새 디렉토리 / 현재 디렉토리)
        ├─ 2. 대화형 프롬프트 (프로젝트명, PM, 프리셋, 라이브러리)
        ├─ 3. create-next-app 실행
        ├─ 4. 프리셋 디렉토리 구조 적용
        ├─ 5. 선택한 라이브러리 설치 + 최소 설정
        ├─ 6. README.md, DECISIONS.md 생성
        └─ 7. 완료
```

QuickStackTool은 실행 후 사용자 프로젝트에 남지 않습니다. 결과물은 순수한 Next.js 프로젝트입니다.

---

## Requirements

- Node.js >= 22.0.0
- npm, pnpm, 또는 yarn

## License

MIT
