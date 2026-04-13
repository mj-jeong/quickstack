# cc-company Testing Strategy

## 원칙

- **순수 로직에 집중**: mock으로 접착제 코드를 테스트하지 않는다. 구현을 두 번 쓰는 것이지 동작을 검증하는 게 아니다.
- **커버리지 숫자 목표 없음**: 숫자를 채우기 위한 mock 테스트 양산은 시간 낭비. 깨지면 치명적인 분기만 커버.
- **구현과 테스트를 함께 작성**: 모듈 구현 직후 해당 테스트를 작성한다. 일괄 작성 금지.

- 중요!: 테스트는 해당 모듈 구현 직후 바로 작성한다. 구현 계획에 테스트 작성 시점이 명시된다.

## 테스트 작성 시점

테스트는 해당 모듈 구현 직후 바로 작성한다. 일괄 작성 금지.

| Phase | 동반 작성 테스트 | 테스트 대상 (순수 로직만) |
|-------|-----------------|------------------------|
| Phase 2 (Core) | context.test.ts | Zod 스키마 파싱 — 유효/무효 입력, 기본값 |
| Phase 2 (Core) | registry.test.ts | 위상정렬, 순환 의존 감지, modifies 충돌 경고 |
| Phase 2 (Core) | validate.test.ts | 프로젝트명 regex, 예약어 거부 |
| Phase 3 (CLI) | resolve-deps.test.ts | shadcn→tailwind 자동 포함, 중복 제거 |
| Phase 4 (Integrations) | options.test.ts | context→CNA 인자 매핑 |
| Phase 5 (Generators) | render-readme.test.ts | 섹션 포함/제외, PM별 명령어 |
| Phase 5 (Generators) | render-decisions.test.ts | 출처 구분, 선택 라이브러리별 항목 |
| enhance Phase 1 (Schema) | context.test.ts | auth, database 필드 파싱 추가 |
| enhance Phase 2 (Prompts) | resolve-deps.test.ts | shadcn→lucide-react 자동 포함 추가 |
| enhance Phase 4 (Generators) | render-readme.test.ts | Auth, Database 섹션 확인 |
| enhance Phase 4 (Generators) | render-decisions.test.ts | 신규 라이브러리 항목 확인 |

## 제외 대상

아래는 unit test를 작성하지 않는다:

- **IO 래퍼**: exec.ts, logger.ts — 접착제 코드를 mock으로 테스트하는 것은 구현을 두 번 쓰는 것
- **파이프라인**: pipeline.ts — 오케스트레이션 코드. Phase 6 integration test에서 커버
- **prompt 함수들**: inquirer IO 의존. 순수 로직이 아님
- **에러 클래스**: errors.ts — 단순 선언. 테스트 가치 없음
- **정적 데이터**: preset 정의, trivial한 조건 분기(gitignore, env)

## 3-Layer 테스트 아키텍처

| Layer | Scope | CNA | 속도 | CI 실행 |
|-------|-------|-----|------|---------|
| Unit | 순수 로직 | 없음 | ~3s | 모든 PR |
| Integration | 파이프라인 전체 (fixture 기반) | Fixture | ~10s | 모든 PR |
| E2E | 실제 CNA 실행 + 전체 파이프라인 | 실행 | ~3-5min | main merge only |
