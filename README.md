# AntWork Backend

Express.js 기반의 백엔드 API 서버입니다.

## 프로젝트 구조

```
antwork_back/
├── app.js                 # 메인 애플리케이션 진입점
├── controllers/           # 비즈니스 로직 컨트롤러
├── models/               # MongoDB 스키마 모델
├── routes/               # API 라우터
├── utils/                # 유틸리티 함수들
└── package.json          # 프로젝트 설정
```

## 기술 스택

- **Node.js** + **Express.js** - 웹 프레임워크
- **MongoDB** + **Mongoose** - 데이터베이스
- **JWT** - 인증 토큰
- **AWS SDK** - 파일 업로드
- **Cheerio** - 웹 크롤링
- **Multer** - 파일 업로드 처리

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# 서버 설정
PORT=8000
NODE_ENV=development

# MongoDB 연결
MONGODB_URI=mongodb://localhost:27017/antwork_db

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
REDIRECT_URI=http://localhost:3000

# AWS S3 설정
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=your_s3_bucket_name

# 세션 설정
SESSION_SECRET=your_session_secret
```

## 실행 스크립트

### 개발용
```bash
npm run dev          # nodemon으로 개발 서버 실행 (파일 변경 시 자동 재시작)
npm run debug        # 디버그 모드로 실행
```

### 배포용
```bash
npm start            # 기본 서버 실행
npm run prod         # 프로덕션 모드로 실행
```

### 기타
```bash
npm run build        # 빌드 (Node.js 백엔드는 불필요)
npm run clean        # node_modules 삭제 후 재설치
npm run lint         # 린팅 (현재 미설정)
```

## API 엔드포인트

- `/` - 사용자 관련 API
- `/news` - 뉴스 관련 API
- `/community` - 커뮤니티 관련 API
- `/virtual` - 가상 거래 관련 API
- `/mypage` - 마이페이지 관련 API
- `/kakao` - 카카오 OAuth 관련 API

## 포트

기본 포트: **8000** (환경 변수 PORT로 변경 가능)
