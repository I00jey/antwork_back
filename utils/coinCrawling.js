// 코인뉴스 크롤링(코인니스)
const cheerio = require('cheerio');
// const iconv = require('iconv-lite');
const axios = require('axios');

const getOriginNews = async (originUrl) => {
    try {
        // Axios 사용하여 웹 페이지의 HTML을 가져옴
        const response = await axios.get(originUrl, {
            responseType: 'arrayBuffer',
        });
        // response.data를 Buffer로 변환하고, toString()을 사용하여 인코딩 적용
        const newsDecoded = Buffer.from(response.data).toString('utf-8');
        // cheerio를 사용하여 HTML를 파싱
        const $ = cheerio.load(newsDecoded);
        // 원하는 정보를 추출하여 출력 또는 다른 작업 수행
        const newContentArray = $('#article-view-content-div > p:nth-child(n)');
        var newContent = '';
        // 선택한 요소의 형제 요소들을 반복
        newContentArray.siblings('p').each(function () {
            newContent += $(this).text() + '\n';
        });
        const bigImageUrl = $(
            '#article-view-content-div > div:nth-child(1) > figure > div > img'
        ).attr('src');
        var bigImageAndContent = {
            newContent,
            bigImageUrl,
        };
        return bigImageAndContent;
    } catch (error) {
        console.error(error);
        return;
    }
};

const getCoinNewsList = async (newsFieldUrl) => {
    try {
        // Axios 사용하여 웹 페이지의 HTML을 가져옴
        // get 함수를 사용하여 지정된 URL에서 GET 요청을 보냄
        // Axios 사용하여 웹 페이지의 HTML을 가져옴
        const response = await axios.get(newsFieldUrl, {
            responseType: 'arrayBuffer',
        });

        const listDecoded = Buffer.from(response.data).toString('utf-8');

        const $ = cheerio.load(listDecoded);
        const listArray = $('#section-list > ul > li:nth-child(n)').toArray();

        var listResult = [];
        for (const dataList of listArray) {
            const smallImage = $(dataList).find('div > a > img');
            const smallimg = smallImage.attr('src');
            const url =
                'https://www.digitaltoday.co.kr' +
                $(dataList).find('div > a').attr('href');
            const date = $(dataList).find('span > em').text();
            const title = $(dataList).find(' div > h4 > a').text();
            try {
                const bigImageAndContent = await getOriginNews(url);
                const content = bigImageAndContent.newContent;
                const bigimg = bigImageAndContent.bigImageUrl;

                listResult.push({
                    url,
                    title,
                    smallimg,
                    bigimg,
                    content,
                    date,
                });
            } catch (error) {
                console.error('list push 에러');
                continue;
            }
        }
        return listResult;
    } catch (error) {
        console.error('뉴스 리스트 불러오기 실패', error);
    }
};
module.exports = getCoinNewsList;
