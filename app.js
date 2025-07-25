const cors = require('cors');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoConnect = require('./models/Mindex');

app.set('trust proxy', 1); // 프록시 뒤 HTTPS 인식용

mongoConnect();
const PORT = process.env.PORT || 8000;

app.use(
    cors({
        origin: process.env.FRONT_URI,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    })
);


const bodyParser = require('body-parser');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello from backend!')
});
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
