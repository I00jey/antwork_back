const Cnews = require('../controllers/Cnews');
const router = require('express').Router();

router.get('/', Cnews.sendEconomyNews);

router.get('/stock', Cnews.sendStockNews);
router.get('/coin', Cnews.sendCoinNews);
router.get('/economy', Cnews.sendEconomyNews);

router.get('/reset', Cnews.resetNewsList);
router.get('/getstock', Cnews.getStockNews);
router.get('/getcoin', Cnews.getCoinNews);
router.get('/geteconomy', Cnews.getEconomyNews);

router.get('/mainNews', Cnews.getMainNews);

router.post('/likedWords', Cnews.getMyWords);

router.post('/deleteWords', Cnews.deleteMyWords);

router.get('/getMyNews', Cnews.getMyNews);

// -------------------------------------------------------------------
router.get('/getDetail', Cnews.getDetail);
router.get('/getWordsDb', Cnews.getWordsDb);

router.get('/checkMyWord', Cnews.checkMyWord);
router.post('/saveMyWord', Cnews.saveMyWord);

router.get('/checkMyNews', Cnews.checkMyNews);
router.post('/saveMyNews', Cnews.saveMyNews);

router.post('/myHighlight', Cnews.myHighlight);

router.get('/getHighlight', Cnews.getHighlight);

router.post('/deleteHighlight', Cnews.deleteHighlight);

module.exports = router;
