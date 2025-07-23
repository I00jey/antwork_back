// 코인뉴스 크롤링(블루밍비트)
// const cheerio = require('cheerio');
// const axios = require('axios');

// const getOriginNews = async (originUrl) => {
//     try {
//         // Axios 사용하여 웹 페이지의 HTML을 가져옴
//         const response = await axios.get(originUrl, {
//             responseType: 'arrayBuffer',
//         });
//         // response.data를 Buffer로 변환하고, toString()을 사용하여 인코딩 적용
//         const newsDecoded = Buffer.from(response.data).toString('utf-8');
//         // cheerio를 사용하여 HTML를 파싱
//         const $ = cheerio.load(newsDecoded);
//         // 원하는 정보를 추출하여 출력 또는 다른 작업 수행
//         const newContentArray = $('#article-view-content-div > p:nth-child(n)');
//         var newContent = '';
//         // 선택한 요소의 형제 요소들을 반복
//         newContentArray.siblings('p').each(function () {
//             newContent += $(this).text() + '\n';
//         });
//         const bigImageUrl = $(
//             '#article-view-content-div > div:nth-child(1) > figure > div > img'
//         ).attr('src');
//         var bigImageAndContent = {
//             newContent,
//             bigImageUrl,
//         };
//         return bigImageAndContent;
//     } catch (error) {
//         console.error(error);
//         return;
//     }
// };

// const getCoinNewsList = async (newsFieldUrl) => {
//     try {
//         // Axios 사용하여 웹 페이지의 HTML을 가져옴
//         // get 함수를 사용하여 지정된 URL에서 GET 요청을 보냄
//         // Axios 사용하여 웹 페이지의 HTML을 가져옴
//         const response = await axios.get(newsFieldUrl, {
//             responseType: 'arrayBuffer',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36',
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
//                 'Accept-Language': 'ko-KR,ko;q=0.9',
//                 'Referer': 'https://www.google.com',
//             },
//         });

//         const listDecoded = Buffer.from(response.data).toString('utf-8');

//         const $ = cheerio.load(listDecoded);
//         const listArray = $('#feedRealTimeContainer > section > div > div:nth-child(1) > div > div > div:nth-child(1) > div > section').toArray();
//         console.log('웹 크롤링 리스트 ->', listArray);

//         var listResult = [];
//         for (const dataList of listArray) {
//             console.log('웹 크롤링 데이터 ->', dataList);
//             const smallImage = $(dataList).find('div > a > img');
//             const smallimg = smallImage.attr('src');
//             const url =
//                 'https://bloomingbit.io' +
//                 $(dataList).find('div > a').attr('href');
//             const date = $(dataList).find('span > em').text();
//             const title = $(dataList).find(' div > h4 > a').text();
//             try {
//                 const bigImageAndContent = await getOriginNews(url);
//                 const content = bigImageAndContent.newContent;
//                 const bigimg = bigImageAndContent.bigImageUrl;

//                 listResult.push({
//                     url,
//                     title,
//                     smallimg,
//                     bigimg,
//                     content,
//                     date,
//                 });
//             } catch (error) {
//                 console.error('list push 에러');
//                 continue;
//             }
//         }
//         return listResult;
//     } catch (error) {
//         console.error('뉴스 리스트 불러오기 실패', error);
//     }
// };


// -------------------------------------------------------------------
// puppeteer로 브라우저를 직접 띄워서 데이터 추출
const puppeteer = require('puppeteer');
const pLimit = require('p-limit');
const limit = pLimit(5); // 동시에 최대 5개까지 처리

const getOriginNews = async (originUrl) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(originUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        let newContent = '';
        $('#article-view-content-div > p:nth-child(n)').each(function () {
            newContent += $(this).text() + '\n';
        });
        const bigImageUrl = $('#article-view-content-div img').first().attr('src');

        return {
            newContent,
            bigImageUrl,
        };
    } catch (error) {
        console.error('getOriginNews 오류:', error);
        return { newContent: '', bigImageUrl: '' };
    } finally {
        if (browser) await browser.close();
    }
};


const getCoinNewsList = async (newsFieldUrl) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(newsFieldUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const listArray = $('#section-list > ul > li:nth-child(n)').toArray();
        console.log('크롤링한 리스트 수 ->', listArray.length);

        const listResult = await Promise.all(listArray.map((dataList) =>
            limit(async () => {
                const smallImg = $(dataList).find('div > a > img').attr('src');
                const relativeUrl = $(dataList).find('div > a').attr('href');
                const url = 'https://www.digitaltoday.co.kr' + relativeUrl;
                const date = $(dataList).find('span > em').text();
                const title = $(dataList).find('div > h4 > a').text().trim();

                try {
                    const { newContent, bigImageUrl } = await getOriginNews(url);
                    return {
                        url,
                        title,
                        smallimg: smallImg,
                        bigimg: bigImageUrl,
                        content: newContent,
                        date
                    };
                } catch (error) {
                    console.error("개별 뉴스 크롤링 실패 ->", url);
                    return null;
                }
            })
        ));
        return listResult.filter(Boolean);  // 실패한 항목 제거

    } catch (error) {
        console.error('puppeteer 크롤링 에러 ->', error);
        await browser.close();
        return [];
    }
}


module.exports = getCoinNewsList;
