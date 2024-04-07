const Cmypage = require('../controllers/Cmypage');
const router = require('express').Router();
const { S3Client } = require('@aws-sdk/client-s3');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid4');

require('dotenv').config();
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

const upload = multer({ storage: storage });

router.post('/getUserInfo', Cmypage.getMyInfo);
router.post('/checkUserNickname', Cmypage.checkUserNickname);
router.post('/checkUserPassword', Cmypage.checkUserPassword);
router.post(
    '/modifyUserInfo',
    upload.single('user_profile'),
    Cmypage.modifyUserInfo
);
router.post('/deleteUserinfo', Cmypage.deleteUserinfo);

module.exports = router;
