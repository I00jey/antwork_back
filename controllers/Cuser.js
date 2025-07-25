const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserSchema = require('../models/UserSchema');
const StockWordSchema = require('../models/StockWordSchema');
const { tokenCheck } = require('../utils/tokenCheck');
const CommunitySchema = require('../models/CommunitySchema');
const DeleteCommunitySchema = require('../models/DeleteCommunitySchema');

require('dotenv').config();
const jwtSecret = process.env.JWTSECRET;
const cookieConfig = {
    maxAge: 60 * 60 * 1000,  // 1시간
    httpOnly: true,          // 자바스크립트에서 쿠키 접근 차단 (보안)
    secure: true,            // HTTPS 환경에서만 쿠키 전송
    sameSite: 'none',        // cross-site 요청 허용 (프론트-백엔드 도메인 다를 때 필수)
};

const cookieConfig2 = {
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7일
    httpOnly: true,
    secure: true,
    sameSite: 'none',
};

exports.userLogin = async (req, res) => {
    try {
        const { user_id, user_password, isChecked } = req.body;
        console.log(user_id, user_password, isChecked);

        // 아이디 저장
        if (isChecked === true) {
            res.cookie('saveId', user_id, cookieConfig2);
        }

        // console.log(req.cookies.saveId);

        const user = await UserSchema.findOne({
            user_id: user_id,
        });

        if (!user) {
            res.json({
                success: false,
                message: '존재하지 않는 아이디입니다.',
                cookieId: req.cookies.saveId,
            });
        } else {
            const storedPassword = user.user_password;
            const isPasswordMatch = bcrypt.compareSync(
                user_password,
                storedPassword
            );

            if (!isPasswordMatch) {
                res.json({
                    success: false,
                    message: '비밀번호가 일치하지 않습니다.',
                    cookieId: req.cookies.saveId,
                });
            } else {
                res.cookie('isKakao', false, cookieConfig);
                const token = jwt.sign({ id: user_id }, jwtSecret);
                res.cookie('jwtCookie', token, cookieConfig);
                res.json({ success: true, cookieId: req.cookies.saveId });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: '로그인 실패' });
    }
};

exports.userRegister = async (req, res) => {
    try {
        console.log(req.body);

        const hashedPw = bcrypt.hashSync(req.body.user_password, 10);
        await UserSchema.create({
            user_id: req.body.user_id,
            user_password: hashedPw,
            user_nickname: req.body.user_nickname,
            user_email: req.body.user_email,
            isKakao: 0,
            isAdmin: 0,
        });

        res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '회원가입 실패' });
    }
};

exports.userIdDuplicate = async (req, res) => {
    try {
        console.log(req.body);
        const { user_id } = req.body;
        const user = await UserSchema.findOne({
            user_id: user_id,
        });
        if (!user) {
            res.send({ success: true, message: '사용가능한 아이디입니다.' });
        } else {
            res.send({
                success: false,
                message: '중복되는 아이디가 있습니다.',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '회원가입 실패' });
    }
};

exports.userNickDuplicate = async (req, res) => {
    try {
        console.log(req.body);
        const { user_nickname } = req.body;
        const user = await UserSchema.findOne({
            user_nickname: user_nickname,
        });
        if (!user) {
            res.send({
                success: true,
                message: '사용가능한 닉네임입니다.',
                // msg: await tokenCheck(req),
            });
        } else {
            res.send({
                success: false,
                message: '중복되는 닉네임이 있습니다.',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '회원가입 실패' });
    }
};

exports.userFindId = async (req, res) => {
    try {
        console.log(req.body);
        const { user_email, user_password } = req.body;

        const user = await UserSchema.findOne({
            user_email: user_email,
        });
        console.log('아이디 찾기', user);
        if (!user) {
            res.send({ success: false });
        } else {
            const storedPassword = user.user_password;
            const isPasswordMatch = bcrypt.compareSync(
                user_password,
                storedPassword
            );

            if (!isPasswordMatch) {
                res.send({
                    success: false,
                    message: '비밀번호가 일치하지 않습니다',
                });
            } else {
                res.send({ success: true, userInfo: user });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '아이디 찾기 실패' });
    }
};

exports.userFindPw = async (req, res) => {
    try {
        console.log(req.body);
        const { user_email, user_id } = req.body;
        const user = await UserSchema.findOne({
            user_id: user_id,
            user_email: user_email,
        });
        console.log(user);
        if (!user) {
            res.send({ success: false });
        } else {
            res.send({ success: true, userInfo: user });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '비밀번호 찾기 실패' });
    }
};

exports.userChangePw = async (req, res) => {
    try {
        console.log(req.body);
        const { user_password, user_id } = req.body;
        const hashedPw = bcrypt.hashSync(user_password, 10);
        const user = await UserSchema.updateOne(
            {
                user_id: user_id,
            },
            {
                $set: { user_password: hashedPw },
            }
        );
        if (!user) {
            res.send({ success: false });
        } else {
            res.send({ success: true, userInfo: user });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '비밀번호 찾기 실패' });
    }
};

exports.getMypage = async (req, res) => {
    try {
        console.log(await tokenCheck(req));
    } catch (error) {
        console.log(error);
    }
};

// 관리자 페이지 유저 가져오기
exports.getAllUser = async (req, res) => {
    try {
        const allUser = await UserSchema.find({});

        console.log('회원 조회', allUser);
        res.json(allUser);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

// 관리자 페이지 신고글 가져오기
exports.getReportPost = async (req, res) => {
    try {
        const reportPost = await CommunitySchema.find({
            reportedUser: { $exists: true, $not: { $size: 0 } },
        }).populate('userId', 'user_nickname user_profile');
        res.json(reportPost);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

exports.getAllPost = async (req, res) => {
    try {
        const allPost = await DeleteCommunitySchema.find({});
        console.log('회원 조회', allPost);
        res.json(allPost);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

// 영구 삭제 (deleteCommunityData)
exports.realDeleteCommunity = async (req, res) => {
    try {
        const _id = req.body.postId;
        const del = await DeleteCommunitySchema.deleteOne({ _id });

        res.send(del);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};

exports.recoverCommunity = async (req, res) => {
    try {
        const _id = req.body.postId;
        const result = await DeleteCommunitySchema.findByIdAndDelete({ _id });

        console.log('recover find > ', result);

        // CommunitySchema에 저장할 데이터 생성
        const communityData = {
            _id: result._id,
            userId: result.userId,
            title: result.title,
            content: result.content,
            subject: result.subject,
            date: result.date,
            like: result.like,
            likedUser: result.likedUser,
            image: result.image,
            reportedUser: [],
        };

        // DeleteCommunitySchema에 저장
        await CommunitySchema.create(communityData);

        res.send(communityData);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
};
