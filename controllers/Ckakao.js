require('dotenv').config();
const axios = require('axios');
const UserSchema = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const cookieConfig = {
    maxAge: 12 * 60 * 60 * 1000, // 로그인 jwt쿠키 12시간 지속
};

async function call(method, uri, param, header) {
    try {
        const response = await axios({
            method,
            url: uri,
            headers: header,
            data: param,
        });
        return response.data;
    } catch (err) {
        return err.response?.data || { error: 'Axios call failed' };
    }
}

let kakaoToken = '';

exports.login = async (req, res) => {
    console.log('로그인 요청');

    try {
        // 🔁 URLSearchParams로 대체 (querystring 제거)
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            redirect_uri: process.env.REDIRECT_URI,
            client_secret: process.env.CLIENT_SECRET,
            code: req.query.code,
        });

        const tokenRes = await call(
            'POST',
            process.env.TOKEN_URI,
            params.toString(),
            { 'Content-Type': 'application/x-www-form-urlencoded' }
        );

        kakaoToken = tokenRes.access_token;
        if (!kakaoToken) throw new Error('카카오 토큰 획득 실패');

        // 🔍 사용자 정보 요청
        const userInfo = await call(
            'POST',
            `${process.env.API_HOST}/v2/user/me`,
            {},
            {
                'Content-Type':
                    'application/x-www-form-urlencoded;charset=utf-8',
                Authorization: `Bearer ${kakaoToken}`,
            }
        );

        const userid = userInfo.id.toString();
        const usernickname = userInfo.properties.nickname;
        const userprofile = userInfo.properties.profile_image;
        const useremail = userInfo.kakao_account.email;

        // 🔐 사용자 ID를 해싱해서 비밀번호 대체용으로 사용
        const userpassword = bcrypt.hashSync(userid, 10);

        // ⚙️ 유저 없으면 새로 생성
        let user = await UserSchema.findOne({ user_id: userid });
        if (!user) {
            user = await UserSchema.create({
                user_id: userid,
                user_password: userpassword,
                user_email: useremail,
                user_nickname: usernickname,
                user_profile: userprofile,
                isKakao: 1,
            });
        }

        // 🍪 쿠키 설정
        res.cookie('isKakao', true, cookieConfig);

        const token = jwt.sign({ id: userid }, process.env.JWTSECRET);
        res.cookie('jwtCookie', token, cookieConfig);
        res.cookie('kakaoToken', kakaoToken, cookieConfig);

        res.json({ success: true, cookieId: req.cookies.saveId });
    } catch (error) {
        console.error('[로그인 실패]', error);
        res.status(500).json({
            success: false,
            message: '로그인 중 오류 발생',
        });
    }
};

// 회원탈퇴
exports.exit = async (req, res) => {
    try {
        const rtn = await call(
            'POST',
            `${process.env.API_HOST}/v1/user/unlink`,
            null,
            {
                Authorization: 'Bearer ' + req.body.kakaoToken,
            }
        );

        kakaoToken = '';
        res.send({ success: true, message: '카카오 회원 탈퇴 성공' });
    } catch (error) {
        console.error('[회원탈퇴 실패]', error);
        res.send({ success: false, message: '카카오 회원 탈퇴 취소' });
    }
};
