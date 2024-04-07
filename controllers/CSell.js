const VirtualSchema = require('../models/VirtualSchema');
const StockWordSchema = require('../models/StockWordSchema');
const UserSchema = require('../models/UserSchema');
const { tokenCheck } = require('../utils/tokenCheck');

exports.post_profit = async (req, res) => {
    const { profit } = req.body;
    const { jwtCookie } = req.cookies;
    const userid = await tokenCheck(req);
    console.log('req.body > ', profit);

    try {
        if (jwtCookie) {
            let searchData = await VirtualSchema.findOne({ userid: userid });

            if (!searchData) {
                // userid가 없으면 정보 저장
                const newData = new VirtualSchema({
                    userid: userid,
                    profit: profit,
                    win: 0,
                    loss: 0,
                });
                searchData = await newData.save();
            } else {
                searchData.profit += profit;
            }

            // 수익에 따른 이긴 횟수, 진 횟수 통계
            if (profit > 0) {
                searchData.win ? (searchData.win += 1) : (searchData.win = 1);
                console.log('profit win');
            }
            if (profit < 0) {
                searchData.loss
                    ? (searchData.loss += 1)
                    : (searchData.loss = 1);
                console.log('profit loss');
            }

            await searchData.save();
            res.send({ success: true });
        } else {
            console.log('not jwt, 비로그인임');
        }
    } catch (error) {
        console.log(error);
        res.send({ success: false });
    }
};

// 모의투자 통계
exports.post_showRecord = async (req, res) => {
    try {
        const userid = await tokenCheck(req);
        console.log('userid record', userid);

        const record = await VirtualSchema.findOne({ userid: userid });
        const { profit, win, loss, profitArray } = record;

        console.log('레코드 구조 분해 > ', profit, win, loss, profitArray);

        res.send({
            profit: profit,
            win: win,
            loss: loss,
            profitArray: profitArray,
        });
    } catch (error) {
        console.log('post record error > ', error);
        res.send(error);
    }
};

// P&L 출력
exports.post_ProfitAndLoss = async (req, res) => {
    try {
        const { profit } = req.body;
        const userid = await tokenCheck(req);
        if (userid) {
            const ProfitAndLoss = await VirtualSchema.findOneAndUpdate(
                { userid: userid },
                { $push: { profitArray: profit } },
                { returnDocument: 'after' }
            );
        }
    } catch (error) {
        console.log(error);
    }

    res.send(true);
};

//모의투자 랭킹 보기
exports.post_showRank = async (req, res) => {
    try {
        let rank = [];
        let profileValue = [];
        const userId = await tokenCheck(req);

        const user = await UserSchema.find({});
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }

        user.map((item) => {
            let userid = item.user_id;
            let profile = item.user_profile;
            profileValue.push({ userid, profile });
        });

        //profit, win으로 정렬 우선순위 설정
        const allRank = await VirtualSchema.find().sort({
            profit: -1,
            win: -1,
        });

        allRank.map((item) => {
            const { userid, profit, win } = item;
            for (let i = 0; i < profileValue.length; i++) {
                let profile = profileValue[i].profile;
                if (userid === profileValue[i].userid) {
                    rank.push({ userid, profit, win, profile });
                }
            }
        });
        res.send({ rank: rank });
    } catch (err) {
        res.send(err);
    }
};

// 클릭한 용어의 설명을 출력
exports.get_vocabulary = async (req, res) => {
    try {
        const { eng_word } = req.query;
        console.log(req.query);
        const word = await StockWordSchema.findOne({
            eng_word: eng_word,
        });
        res.send({ data: word });
    } catch (error) {
        console.log(error);
    }
};
