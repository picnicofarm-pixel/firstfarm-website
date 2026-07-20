# 퍼스트팜 기업 홈페이지

스마트농업 구축, 디지털 운영, 교육 콘텐츠, 지역·공공 협력을 소개하는 React 기반 기업 홈페이지입니다.

## 실행

```powershell
npm.cmd install
npm.cmd run dev
```

## 빌드

```powershell
npm.cmd run build
```

## 주요 경로

- `/` 메인
- `/about` 회사소개
- `/business` 사업영역
- `/solutions` 솔루션
- `/solutions/smart-farm`, `/platform`, `/education`, `/soopdok` 솔루션 상세
- `/projects` 프로젝트
- `/partnership` 파트너십
- `/ir` IR
- `/news` 소식
- `/contact` 문의
- `/admin` 관리자 시제품

## 콘텐츠 저장

현재 관리자 데이터는 `src/services/contentRepository.js`를 통해 브라우저 `localStorage`에 저장됩니다. 실제 운영 시 해당 저장소 구현을 Supabase, Firebase 또는 자체 API 호출로 교체하면 여러 기기에서 로그인 기반으로 콘텐츠를 관리할 수 있습니다.

## 콘텐츠 원칙

확인되지 않은 고객, 프로젝트 성과, 매출, 인증·특허·수상, 연락처 등의 정보는 표시하지 않습니다. 실제 자료가 필요한 영역은 관리자 입력용 플레이스홀더로 남겨 두었습니다.
