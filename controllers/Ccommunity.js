const CommunitySchema = require('../models/CommunitySchema');
const CommentSchema = require('../models/CommentSchema');
const ReCommentSchema = require('../models/ReCommentSchema');
const DeleteCommunitySchema = require('../models/DeleteCommunitySchema');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const { tokenCheck } = require('../utils/tokenCheck');
const UserSchema = require('../models/UserSchema');

exports.community = async (req, res) => {};

// 1. DB 저장

exports.communityWrite = async (req, res) => {
    try {
        const userId = await tokenCheck(req);

        const user = await UserSchema.findOne({
            user_id: userId,
        });
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }

        const nickName = user.user_nickname;
        const user_Profile = user.user_profile;
        const user_id = user._id;

        const imageUrl = req.file ? req.file.location : null;
        await CommunitySchema.create({
            userId: user_id,
            userNickName: nickName,
            title: req.body.title,
            content: req.body.content,
            subject: req.body.subject,
            // 파일
            image: imageUrl,
            // 한국 시간 (등록 시간)
            date: new Date().toISOString(),
        });

        res.send('게시글 작성 완료');
    } catch (err) {
        console.log(err);
        res.status(500).send('게시글 작성 실패');
    }
};

// 2. 저장된 값 불러와서 메인 커뮤니티 화면에 보내주기 (최신순으로)
exports.communityRead = async (req, res) => {
    // DB에서 데이터 가져오기
    try {
        const communityPosts = await CommunitySchema.find()
            .populate('userId', 'user_nickname user_profile')
            .sort({
                // 내림차순
                date: -1,
            });
        res.json(communityPosts);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

// 좋아요 데이터
exports.communityLike = async (req, res) => {
    try {
        console.log('Received POST request to /community/like');
        const userId = await tokenCheck(req);

        // 어떤 유저가 좋아요 했는지 확인
        const user = await UserSchema.findOne({
            user_id: userId,
        });
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }
        console.log(req.body);
        // 커뮤니티에서 id로 게시글 찾기
        const community = await CommunitySchema.findOne({
            _id: req.body.postId || req.body.data._id || req.body.postData._id,
        });

        if (community) {
            const userIndex = community.likedUser.indexOf(user._id);

            if (userIndex !== -1) {
                // 이미 좋아요를 누른 경우, 좋아요 취소
                community.likedUser.splice(userIndex, 1);
                await community.save();

                // 좋아요 취소 후의 게시글 데이터를 반환
                return res.json(community);
            } else {
                // 좋아요를 누르지 않은 경우, 좋아요 추가
                community.likedUser.push(user._id);
                await community.save();

                // 좋아요 완료 후의 게시글 데이터를 반환
                return res.json(community);
            }
        } else {
            return res.status(404).send('게시글 확인 불가');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('좋아요 오류 ');
    }
};

// 댓글 작성
exports.commentWrite = async (req, res) => {
    try {
        console.log('Received POST request to /community/commentWrite');

        const userId = await tokenCheck(req);
        // console.log(userId);

        const user = await UserSchema.findOne({
            user_id: userId,
        });
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }

        const nickName = user.user_nickname;
        const user_id = user._id;

        await CommentSchema.create({
            communityId: req.body.postId,
            userId: user_id,
            userNickName: nickName,
            content: req.body.content,
            date: new Date().toISOString(),
        });
        res.send('댓글 작성 완료!');
    } catch (err) {
        console.log(err);
        res.status(500).send('댓글 작성 실패');
    }
};
// 댓글 호출
exports.commentRead = async (req, res) => {
    // // DB에서 데이터 가져오기
    const postId = req.query.postId;
    try {
        const comment = await CommentSchema.find({ communityId: postId })
            .populate('userId', 'user_nickname user_profile')
            .sort({
                date: -1,
            });
        res.json(comment);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

// 좋아요 순위로 가져오기
exports.communityRank = async (req, res) => {
    // DB에서 데이터 가져오기
    try {
        const rankPosts = await CommunitySchema.find().populate(
            'userId',
            'user_nickname user_profile'
        );
        res.json(rankPosts);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

// 대댓글 작성
exports.replyWrite = async (req, res) => {
    try {
        console.log('Received POST request to /community/replyWrite');

        const userId = await tokenCheck(req);

        const user = await UserSchema.findOne({
            user_id: userId,
        });
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }

        const nickName = user.user_nickname;
        const user_id = user._id;

        await ReCommentSchema.create({
            commentId: req.body.commentId,
            userId: user_id,
            userNickName: nickName,
            content: req.body.content,
            date: new Date().toISOString(),
        });
        res.send('댓글 작성 완료!');
    } catch (err) {
        console.log(err);
        res.status(500).send('댓글 작성 실패');
    }
};

//대댓글 호출
exports.replyRead = async (req, res) => {
    // // DB에서 데이터 가져오기
    const commentID = req.query.data;
    try {
        const comment = await ReCommentSchema.find({
            commentId: commentID,
        })
            .populate('userId', 'user_nickname user_profile')
            .sort({
                date: -1,
            });
        res.json(comment);
    } catch (err) {
        console.log(err);
        res.status(500).send('데이터 불러오기 실패');
    }
};

exports.getMainBoards = async (req, res) => {
    try {
        const board = await CommunitySchema.find()
            .populate('userId', 'user_nickname user_profile')
            .sort({
                // 내림차순
                date: -1,
            })
            .limit(10);

        if (board.length === 0) {
            res.send({ success: false, msg: '등록한 글이 없습니다.' });
        } else {
            res.send({ success: true, board: board });
        }
    } catch (error) {
        console.log(error);
    }
};

exports.modifyCommunity = async (req, res) => {
    try {
        const result = await CommunitySchema.updateOne(
            { _id: req.body._id },
            {
                subject: req.body.subject,
                title: req.body.title,
                content: req.body.content,
            }
        );
        res.send('데이터 수정 성공');
    } catch (error) {
        res.send('데이터 수정 실패');
    }
};

exports.updateCommunity = async (req, res) => {
    try {
        const result = await CommunitySchema.findById(req.query.postid);
        res.send(result);
    } catch (error) {
        console.log(error);
        res.send('수정 데이터 불러오기 실패');
    }
};

exports.deleteCommunity = async (req, res) => {
    try {
        const result = await CommunitySchema.findByIdAndDelete(
            req.body.communityId
        );

        // DeleteCommunitySchema에 저장할 데이터 생성
        const deleteCommunityData = {
            userId: result.userId,
            title: result.title,
            content: result.content,
            subject: result.subject,
            date: result.date,
            like: result.like,
            likedUser: result.likedUser,
            image: result.image,
            reportedUser: result.reportedUser,
        };

        // DeleteCommunitySchema에 저장
        await DeleteCommunitySchema.create(deleteCommunityData);

        res.send(result);
    } catch (error) {
        console.log('del err', error);
        res.send('게시물 삭제 실패');
    }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
    try {
        const result = await CommentSchema.findByIdAndDelete(
            req.body.commentId
        );
        // 대댓글까지 삭제
        const resultRe = await ReCommentSchema.deleteMany({
            commentId: req.body.commentId,
        });
        res.send(result);
    } catch (error) {
        res.send('댓글 삭제 실패');
    }
};

exports.deleteReComment = async (req, res) => {
    try {
        const result = await ReCommentSchema.findByIdAndDelete(
            req.body.reCommentId
        );
        res.send(result);
    } catch (err) {
        res.send('대댓글 삭제 실패');
    }
};

exports.searchCommunity = async (req, res) => {
    try {
        const regex = new RegExp(req.query.searchWord, 'i');
        const searchResult = await CommunitySchema.find({
            $or: [{ title: regex }, { content: regex }],
        })
            .populate('userId', 'user_nickname user_profile')
            .sort({
                date: -1,
            })
            .limit(5);
        res.send(searchResult);
    } catch (error) {
        //console.log('게시물 DB 검색 실패', error);
        res.send('게시물 DB 검색 실패');
    }
};

// 신고하기
exports.reportCommunity = async (req, res) => {
    try {
        const { reportData } = req.body;

        const userId = await tokenCheck(req);

        const user = await UserSchema.findOne({
            user_id: userId,
        });
        if (!user) {
            return res.status(404).send('사용자 확인 불가');
        }

        const user_id = user._id; // 유저 id 키 값

        const result = await CommunitySchema.findById(reportData);

        // 유저아이디가 포함되어있으면 삭제하게 처리
        const alreadyReported = result.reportedUser.includes(user_id);

        let active;

        if (alreadyReported) {
            result.reportedUser = result.reportedUser.filter(
                (id) => id.toString() !== user_id.toString()
            );
            active = false;
        } else {
            result.reportedUser.push(user_id);
            active = true;
        }

        await result.save();

        res.send({ result, active });
    } catch (error) {
        console.log('신고 에러', error);
    }
};

exports.getReportCommunity = async (req, res) => {
    try {
        const { userId, postId } = req.query;

        const result = await CommunitySchema.findById(postId);
        const isUserReported = result.reportedUser.some(
            (reportedUserId) => reportedUserId.toString() === userId.toString()
        );

        res.json({ isUserReported });
    } catch (error) {
        console.log(error);
    }
};

exports.communityGetLike = async (req, res) => {
    try {
        const { userId, postId } = req.query;

        const result = await CommunitySchema.findById(postId);

        const like = result.likedUser.length;

        const isUserliked = result.likedUser.some(
            (likeudUserId) => likeudUserId.toString() === userId.toString()
        );

        res.json({ isUserliked, like });
    } catch (error) {
        console.log(error);
    }
};
