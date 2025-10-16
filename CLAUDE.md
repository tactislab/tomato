# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

토마토 잎 병해 진단 웹 애플리케이션입니다. 사용자가 토마토 잎 사진을 업로드하거나 촬영하면 AI가 병해를 분류해줍니다.

## Architecture

### 프론트엔드 (index.html)
- 단일 페이지 애플리케이션 (Vanilla JavaScript, 프레임워크 없음)
- 카메라 API와 Canvas API를 활용한 이미지 처리
- QRCode.js 라이브러리 사용 (CDN 로드)
- 이미지는 자동으로 1024px로 리사이즈되고 base64로 인코딩

### 백엔드 API (api/classify.js)
- Serverless 함수 (Vercel/Netlify Functions 대상)
- Roboflow API로 프록시 역할
- 환경 변수 필요: `DATASET`, `VERSION`, `ROBOFLOW_API_KEY`

## Development Commands

이 프로젝트는 빌드 단계가 없는 순수 HTML/JS 프로젝트입니다.

### 로컬 개발
```bash
# Python으로 간단한 서버 실행
python -m http.server 8000

# 또는 Node.js의 http-server 사용
npx http-server
```

### API 테스트
API 프록시 함수를 로컬에서 테스트하려면 Vercel CLI 사용:
```bash
vercel dev
```

## Key Configuration Points

### 환경 변수 설정 (배포 플랫폼에서)
- `DATASET`: Roboflow 데이터셋 식별자
- `VERSION`: Roboflow 모델 버전
- `ROBOFLOW_API_KEY`: Roboflow API 키

### API 엔드포인트
- index.html 84번 줄: `/api/classify` URL이 하드코딩되어 있음
- 배포 환경에 따라 이 경로가 올바른지 확인 필요

### 이미지 처리 설정
- 최대 크기: 1024px (가장 긴 변 기준)
- 압축 품질: 0.9 (JPEG)
- 신뢰도 임계값: 60%

## Code Structure

```
├── index.html          # 메인 애플리케이션 (UI + 로직)
├── api/
│   └── classify.js     # Roboflow API 프록시
└── .claude/
    └── settings.local.json
```

## Important Implementation Notes

1. **CORS 처리**: api/classify.js에서 모든 오리진 허용 (`*`)
2. **에러 처리**: 60% 미만의 신뢰도는 "확실한 진단 불가" 메시지 표시
3. **카메라 권한**: MediaDevices API 사용 시 HTTPS 필요
4. **모바일 최적화**: 반응형 디자인, 2열에서 1열로 자동 전환

## Testing Considerations

- 카메라 기능 테스트 시 HTTPS 환경 필요
- 이미지 업로드는 드래그 앤 드롭과 파일 선택 모두 테스트
- Roboflow API 응답 형식 확인 (predictions 배열과 top 객체 포함)