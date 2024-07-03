const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoConnect = require('./models/Mindex');
const qs = require('querystring');

mongoConnect();
const PORT = process.env.PORT || 8000;
app.use(
    cors({
        // origin: 'http://13.125.130.121', // 클라이언트의 도메인
        origin: 'http://localhost:3000',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
);

const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {});
const indexRouter = require('./routes/Ruser');
app.use('/', indexRouter);

const newsRouter = require('./routes/Rnews');
app.use('/news', newsRouter);

const communityRouter = require('./routes/Rcommunity');
app.use('/community', communityRouter);

const virtualRouter = require('./routes/Rvirtual');
app.use('/virtual', virtualRouter);

const mypageRouter = require('./routes/Rmypage');
app.use('/mypage', mypageRouter);

const kakaoRouter = require('./routes/Rkakao');
app.use('/kakao', kakaoRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
