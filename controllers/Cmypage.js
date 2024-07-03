const UserSchema = require('../models/UserSchema');
const CommentSchema = require('../models/CommentSchema');
const CommunitySchema = require('../models/CommunitySchema');
const MyHighlightSchema = require('../models/MyHighlightSchema');
const ReCommentSchema = require('../models/ReCommentSchema');
const VirtualSchema = require('../models/VirtualSchema');

const { tokenCheck } = require('../utils/tokenCheck');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwtSecret = process.env.JWTSECRET;

exports.getMyInfo = async (req, res) => {
    try {
        const id = await tokenCheck(req);
        const user = await UserSchema.findOne({
            user_id: id,
        });
        res.send({ info: user });
    } catch (error) {
        console.log(error);
        res.send('false');
    }
};

exports.checkUserNickname = async (req, res) => {
    try {
        const { user_nickname } = req.body.userData;
        const user = await UserSchema.findOne({
            user_nickname: user_nickname,
        });
        if (!user) {
            res.send({
                success: true,
                message: '사용 가능한 닉네임입니다.',
            });
        } else {
            if (req.body.currentUserId == user.user_id) {
                res.send({
                    success: 'null',
                    message: '현재 사용 중인 아이디입니다.',
                });
            } else {
                res.send({
                    success: false,
                    message: '중복되는 닉네임이 있습니다.',
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '닉네임 변경 실패' });
    }
};
exports.checkUserPassword = async (req, res) => {
    try {
        const { user_password } = req.body.userData;
        const currentUser = await UserSchema.findOne({
            user_id: req.body.currentUserId,
        });
        const result = bcrypt.compareSync(
            user_password,
            currentUser.user_password
        );
        if (!result) {
            res.send({
                success: false,
                message: '비밀번호 확인 실패',
            });
        } else {
            res.send({
                success: true,
                message: '비밀번호 확인 성공',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: '비밀번호 확인 실패' });
    }
};
exports.modifyUserInfo = async (req, res) => {
    const { user_nickname, user_changepw, user_email } = req.body;
    console.log(req.body.user_profile);
    console.log(req.file);
    const user_profile = req.file ? req.file.location : null;

    console.log('user_profile', user_profile);
    const currentUserId = req.body.user_id;
    try {
        console.log('현재 사용자 아이디', currentUserId);
        if (user_changepw == '' && user_profile == null) {
            const modifyUser = await UserSchema.updateOne(
                {
                    user_id: currentUserId,
                },
                {
                    user_email: user_email,
                    user_nickname: user_nickname,
                }
            );
            console.log(modifyUser);
            res.send({
                success: true,
                message: '회원정보 DB 수정 완료',
            });
        } else if (user_changepw == '' && user_profile != null) {
            const modifyUser = await UserSchema.updateOne(
                {
                    user_id: currentUserId,
                },
                {
                    user_email: user_email,
                    user_nickname: user_nickname,
                    user_profile: user_profile,
                }
            );
            console.log(modifyUser);
            res.send({
                success: true,
                message: '회원정보 DB 수정 완료',
            });
        } else if (user_changepw != '' && user_profile == null) {
            const modifyUser = await UserSchema.updateOne(
                {
                    user_id: currentUserId,
                },
                {
                    user_email: user_email,
                    user_nickname: user_nickname,
                    user_profile: user_profile,
                }
            );
            console.log(modifyUser);
            res.send({
                success: true,
                message: '회원정보 DB 수정 완료',
            });
        } else {
            const hashedPw = bcrypt.hashSync(user_changepw, 10);
            const modifyUser = await UserSchema.updateOne(
                {
                    user_id: currentUserId,
                },
                {
                    user_email: user_email,
                    user_password: hashedPw,
                    user_nickname: user_nickname,
                    user_profile: user_profile,
                }
            );
            console.log(modifyUser);
            res.send({
                success: true,
                message: '회원정보 DB 수정 완료',
            });
        }
    } catch (error) {
        console.log('회원정보 DB 수정 에러');
        res.send({
            success: false,
            message: '회원정보 DB 수정 에러',
        });
    }
};
exports.deleteUserinfo = async (req, res) => {
    const userId = req.body.currentUserId;
    try {
        console.log('현재 사용자 아이디', userId);
        const deleteUser = await UserSchema.findOneAndDelete({
            user_id: userId,
        });
        console.log('삭제된 사용자 정보', deleteUser);
        try {
            const result = await CommentSchema.deleteMany({
                userId: deleteUser._id,
            });
            console.log('댓글 삭제', result);
        } catch (error) {
            console.log('댓글 삭제 에러', error);
        }
        try {
            const result = await CommunitySchema.deleteMany({
                userId: deleteUser._id,
            });
            console.log('글 삭제', result);
        } catch (error) {
            console.log('글 삭제 에러');
        }
        try {
            const result = await MyHighlightSchema.findOneAndDelete({
                user_id: deleteUser.user_id,
            });
            console.log('하이라이트 삭제', result);
        } catch (error) {
            console.log('하이라이트 단어 삭제 에러');
        }
        try {
            const result = await ReCommentSchema.deleteMany({
                userId: deleteUser._id,
            });
            console.log('대댓글 삭제', result);
        } catch (error) {
            console.log('대댓글 삭제 에러');
        }
        try {
            const result = await VirtualSchema.deleteMany({
                userid: deleteUser.user_id,
            });
            console.log('모의투자 사용자 기록 삭제', result);
        } catch (error) {
            console.log('모의투자 사용자 기록 에러');
        }

        console.log(deleteUser);

        res.send({
            success: true,
            message: '회원정보 DB 삭제 완료',
        });
    } catch (error) {
        console.log('회원정보 DB 삭제 에러');
        res.send({
            success: false,
            message: '회원정보 DB 삭제 에러',
        });
    }
};
