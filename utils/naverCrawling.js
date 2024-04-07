// (네이버)

const cheerio = require('cheerio');
// const iconv = require('iconv-lite');
const axios = require('axios');

// 매개변수 -> 크롤링하고자 하는 웹 페이지의 URL
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
        let newContent = $('#dic_area').text().trim();
        const imgDesc = $('#dic_area > span.end_photo_org > em').text();
        newContent = newContent.replace(imgDesc, '');
        let subTitle = $('#dic_area > strong').first().text();
        newContent = newContent.replace(subTitle, '');
        const bTag = $('#dic_area > b').first().text();
        newContent = newContent.replace(bTag, '');
        const divTag = $('#dic_area > div').first().text();
        newContent = newContent.replace(divTag, '');
        if (!subTitle) {
            if (!bTag) {
                subTitle = divTag;
            } else {
                subTitle = bTag;
            }
        }
        const bigImageUrl = $('#img1').attr('data-src');
        const newsDate = $(
            '#ct > div.media_end_head.go_trans > div.media_end_head_info.nv_notrans > div.media_end_head_info_datestamp > div > span'
        )
            .first()
            .text()
            .trim();
        var bigImageAndContent = {
            subTitle,
            newContent,
            bigImageUrl,
            newsDate,
        };
        return bigImageAndContent;
    } catch (error) {
        return;
    }
};

const getNaverNewsList = async (newsFieldUrl) => {
    try {
        const response = await axios.get(newsFieldUrl, {
            responseType: 'arrayBuffer',
        });
        // response.data를 Buffer로 변환하고, toString()을 사용하여 인코딩 적용
        const newsDecoded = Buffer.from(response.data).toString('utf-8');
        const $ = cheerio.load(newsDecoded);

        const listArray1 = $(
            // '#main_content > div.list_body.newsflash_body > ul.type06_headline > li:nth-child(n)'
            '#newsct > div.section_latest > div > div.section_latest_article._CONTENT_LIST._PERSIST_META > div:nth-child(1) > ul > li:nth-child(n) > div > div'
        ).toArray();

        const listArray2 = $(
            '#newsct > div.section_latest > div > div.section_latest_article._CONTENT_LIST._PERSIST_META > div:nth-child(2) > ul > li:nth-child(n) > div > div'
        ).toArray();
        const listArray3 = $(
            '#newsct > div.section_latest > div > div.section_latest_article._CONTENT_LIST._PERSIST_META > div:nth-child(3) > ul > li:nth-child(n) > div > div'
        ).toArray();
        const listArray4 = $(
            '#newsct > div.section_latest > div > div.section_latest_article._CONTENT_LIST._PERSIST_META > div:nth-child(4) > ul > li:nth-child(n) > div > div'
        ).toArray();
        listArray = [
            ...listArray1,
            ...listArray2,
            ...listArray3,
            ...listArray4,
        ];

        var listResult = [];
        for (const dataList of listArray) {
            const smallImage = $(dataList).find(
                'div.sa_thumb._LAZY_LOADING_ERROR_HIDE > div > a > img'
            );
            const smallimg = smallImage.attr('data-src');
            const aFind = $(dataList).find(' div.sa_text > a');
            const path = aFind.attr('href');
            const url = `${path}`;
            const title = aFind.find('strong').text().trim();

            try {
                const bigImageAndContent = await getOriginNews(url);
                const content = bigImageAndContent.newContent;
                const bigimg = bigImageAndContent.bigImageUrl;
                const date = bigImageAndContent.newsDate;
                const subtitle = bigImageAndContent.subTitle;

                listResult.push({
                    url,
                    title,
                    smallimg,
                    bigimg,
                    date,
                    content,
                    subtitle,
                });
            } catch (error) {
                continue;
            }
        }
        return listResult;
    } catch (error) {
        console.log('뉴스 리스트 불러오기 실패', error);
    }
};

// --------------------------------------------------------------------------------------
// 모든 경제분야 뉴스 크롤링

const getMainNewsList = async (newsFieldUrl) => {
    try {
        const response = await axios.get(newsFieldUrl, {
            responseType: 'arraybuffer',
            responseEncoding: 'binary',
        });
        const decoder = new TextDecoder('euc-kr');
        const listDecoded = decoder.decode(response.data);

        // cheerio를 사용하여 HTML를 파싱
        const $ = cheerio.load(listDecoded);

        const listArray = $(
            '#main_content > div > div._persist > div.section_headline > ul > li:nth-child(n)'
        ).toArray();

        var listResult = [];
        for (const dataList of listArray) {
            const smallImage = $(dataList).find('div.sh_thumb > div > a > img');
            const smallimg = smallImage.attr('src');
            const aFind = $(dataList).find('div.sh_text > a');
            const path = aFind.attr('href');
            const url = `${path}`;
            const title = aFind.text().trim();

            try {
                const bigImageAndContent = await getOriginNews(url);
                const content = bigImageAndContent.newContent;
                const bigimg = bigImageAndContent.bigImageUrl;
                const date = bigImageAndContent.newsDate;
                const subtitle = bigImageAndContent.subTitle;

                listResult.push({
                    url,
                    title,
                    smallimg,
                    bigimg,
                    date,
                    content,
                    subtitle,
                });
            } catch (error) {
                continue;
            }
        }
        return listResult;
    } catch (error) {
        console.log('뉴스 리스트 불러오기 실패', error);
    }
};

module.exports = { getNaverNewsList, getMainNewsList };
