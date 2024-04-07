require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');
const UserSchema = require('../models/UserSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const cookieConfig = {
    maxAge: 12 * 60 * 60 * 1000, // 로그인 jwt쿠키 12시간 지속
};

async function call(method, uri, param, header) {
    try {
        rtn = await axios({
            method: method,
            url: uri,
            headers: header,
            data: param,
        });
    } catch (err) {
        rtn = err.response;
    }
    return rtn.data;
}

let kakaoToken = '';
exports.login = async (req, res) => {
    console.log('로그인 요청');
    let userid;
    let useremail;
    let userprofile;
    let usernickname;
    let userpassword;

    try {
        const param = qs.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.CLIENT_ID,
            redirect_uri: process.env.REDIRECT_URI,
            client_secret: process.env.CLIENT_SECRET,
            code: req.query.code,
        });
        const header = { 'content-type': 'application/x-www-form-urlencoded' };
        const rtn = await call('POST', process.env.TOKEN_URI, param, header);
        kakaoToken = rtn.access_token;

        try {
            const uri = process.env.API_HOST + '/v2/user/me';
            const param = {};
            const header = {
                'content-type':
                    'application/x-www-form-urlencoded;charset=utf-8',
                Authorization: `Bearer ${kakaoToken}`,
            };
            const rtn = await call('POST', uri, param, header);

            try {
                userid = rtn.id.toString();
                usernickname = rtn.properties.nickname;
                userprofile = rtn.properties.profile_image;
                useremail = rtn.kakao_account.email;
                userpassword = bcrypt.hashSync(userid, 10);

                const checkUser = await UserSchema.findOne({
                    user_id: userid,
                });

                // 해당 유저가 DB에 없으면 DOCUMENT 생성
                if (!checkUser) {
                    const newUser = await UserSchema.create({
                        user_id: userid,
                        user_password: userpassword,
                        user_email: useremail,
                        user_nickname: usernickname,
                        user_profile: userprofile,
                        isKakao: 1,
                    });
                }

                // 카카오 로그인 여부 확인
                res.cookie('isKakao', true, cookieConfig);
                // 현재 사용자 로그인 여부 확인 (카카오 아이디 jwt)
                const token = jwt.sign({ id: userid }, process.env.JWTSECRET);
                res.cookie('jwtCookie', token, cookieConfig);
                // 카카오 로그인 토큰 저장
                res.cookie('kakaoToken', kakaoToken, cookieConfig);
                res.json({ success: true, cookieId: req.cookies.saveId });
            } catch (error) {
                res.send('user db 저장 오류');
                console.log(error);
            }
        } catch (error) {
            // Handle error
            console.error(error);
            res.send('profile 가져오기 오류');
        }
    } catch (error) {
        console.log(error);
        res.send('login 오류');
    }
};

// 회원탈퇴
exports.exit = async (req, res) => {
    const uri = process.env.API_HOST + '/v1/user/unlink';
    const param = null;
    const header = {
        Authorization: 'Bearer ' + req.body.kakaoToken,
    };
    try {
        const rtn = await call('POST', uri, param, header);
        kakaoToken = '';
        res.send({ success: true, message: '카카오 회원 탈퇴 성공' });
    } catch (error) {
        console.log(error);
        res.send({ success: false, message: '카카오 회원 탈퇴 취소' });
    }
};
