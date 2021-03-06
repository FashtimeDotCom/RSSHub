const axios = require('../../utils/axios');
const weiboUtils = require('./utils');
const date = require('../../utils/date');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const containerResponse = await axios({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}`,
        headers: {
            Referer: 'https://m.weibo.cn/',
        },
    });
    const name = containerResponse.data.data.userInfo.screen_name;
    const containerid = containerResponse.data.data.tabsInfo.tabs[1].containerid;

    const response = await axios({
        method: 'get',
        url: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${uid}&containerid=${containerid}`,
        headers: {
            Referer: `https://m.weibo.cn/u/${uid}`,
        },
    });

    ctx.state.data = {
        title: `${name}的微博`,
        link: `http://weibo.com/${uid}/`,
        description: `${name}的微博`,
        item: response.data.data.cards
            .filter((item) => item.mblog && !item.mblog.isTop)
            .map((item) => {
                const description = weiboUtils.format(item.mblog);
                const title = description.replace(/<img.*?>/g, '[图片]').replace(/<.*?>/g, '');
                return {
                    title,
                    description: description,
                    pubDate: date(item.mblog.created_at, 8),
                    link: `https://weibo.com/${uid}/${item.mblog.bid}`,
                };
            }),
    };
};
