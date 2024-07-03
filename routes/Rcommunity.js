const Ccommunity = require('../controllers/Ccommunity');
const router = require('express').Router();
const { S3Client } = require('@aws-sdk/client-s3');
// aws-s3관련 (이미지)
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid4');

require('dotenv').config();

router.get('/', Ccommunity.community);

// 이미지 저장 관련
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESSKEY,
        secretAccessKey: process.env.AWS_SECRECTACCESSKEY,
    },
});

// multer 설정
const storage = multerS3({
    s3: s3,
    acl: 'public-read-write',
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
        const filename = `${uuid()}-${file.originalname}`;
        cb(null, filename);
    },
});

// multer설정을 라우터로 빼기
const upload = multer({ storage: storage });

// 글 추가
router.post('/write', upload.single('file'), Ccommunity.communityWrite);

// 글 읽기
router.get('/read', Ccommunity.communityRead);

// 댓글 데이터 추가
router.post('/commentWrite', Ccommunity.commentWrite);

// // 댓글 호출
router.get('/commentRead', Ccommunity.commentRead);

// 좋아요 추가
router.post('/like', Ccommunity.communityLike);
router.get('/like', Ccommunity.communityGetLike);

// 좋아요 순위로 가져오기
router.get('/rank', Ccommunity.communityRank);

// 대댓글 추가
router.post('/replyWrite', Ccommunity.replyWrite);

// 대댓글 가져오기
router.get('/replyRead', Ccommunity.replyRead);

// 메인페이지 커뮤니티글 5개 가져오기
router.get('/mainBoards', Ccommunity.getMainBoards);

// 커뮤니티 글 수정
router.post('/modify', upload.none(), Ccommunity.modifyCommunity);

// 커뮤니티 글 업데이트
router.get('/update', Ccommunity.updateCommunity);

// 커뮤니티 글 삭제
router.post('/delete', Ccommunity.deleteCommunity);

// 커뮤니티 글 검색 (제목 + 내용)
router.get('/search', Ccommunity.searchCommunity);

// 신고하기
router.post('/report', Ccommunity.reportCommunity);
router.get('/report', Ccommunity.getReportCommunity);

// 댓글 삭제
router.post('/deleteCommnet', Ccommunity.deleteComment);
// 대댓글 삭제
router.post('/deleteReCommnet', Ccommunity.deleteReComment);

module.exports = router;
