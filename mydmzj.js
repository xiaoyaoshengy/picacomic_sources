class MyDMZJ extends ComicSource {  // 首行必须为class...
    // 此漫画源的名称
    name = "动漫之家"

    // 唯一标识符
    key = "mydmzj"

    version = "1.0.0"

    minAppVersion = "4.0.0"

    // 更新链接
    url = "https://raw.githubusercontent.com/xiaoyaoshengy/picacomic_sources/master/mydmzj.js"

    get timestamp() {
        return new Date().getTime()
    }

    async queryJson(query) {
        let res = await Network.get(
            `https://www.idmzj.com/api/v1/comic1/${query}`
        )

        if (res.status !== 200) {
            throw `Invaid Status Code ${res.status}`
        }

        let json = JSON.parse(res.body)

        if (json.errno) {
            throw json.errmsg
        }

        return json
    }

    async queryComics(query, totalName, comicListName, pageSize) {
        let json = await this.queryJson(query)

        function parseComic(comic) {
            let types = comic.types ? comic.types : ""
            types = types.split("/")

            return {
                id: comic.comic_py,
                title: comic.name,
                subTitle: comic.authors,
                cover: comic.cover,
                tags: types,
                description: comic.status,
            }
        }

        let totalNum = json.data[totalName]
        let comicList = totalNum ? json.data[comicListName] : []

        return {
            comics: comicList.map(parseComic),
            maxPage: Math.ceil(totalNum / pageSize),
        }
    }

    /// 账号
    /// 设置为null禁用账号功能
    account = null

    /// 探索页面
    /// 一个漫画源可以有多个探索页面
    explore = [
        {
            /// 标题
            /// 标题同时用作标识符, 不能重复
            title: "动漫之家",

            /// singlePageWithMultiPart 或者 multiPageComicList
            type: "multiPageComicList",

            load: async (page) => {
                return await this.queryComics(
                    `filter?channel=pc&app_name=dmzj&version=1.0.0&timestamp=${this.timestamp}&uid&sortType=0&page=${page}&size=18&status=0&audience=0&theme=0&cate=0&firstLetter`,
                    "totalNum",
                    "comicList",
                    18
                )
            }
        }
    ]

    /// 分类页面
    /// 一个漫画源只能有一个分类页面, 也可以没有, 设置为null禁用分类页面
    category = {
        /// 标题, 同时为标识符, 不能与其他漫画源的分类页面重复
        title: "动漫之家",
        parts: [
            {
                name: "题材",

                // fixed 或者 random
                // random用于分类数量相当多时, 随机显示其中一部分
                type: "fixed",

                // 如果类型为random, 需要提供此字段, 表示同时显示的数量
                // randomNumber: 5,

                categories: ["全部", "冒险", "搞笑", "格斗", "科幻", "爱情", "侦探", "竞技", "魔法", "校园", "百合", "耽美", "历史", "战争", "宅系", "治愈", "仙侠", "武侠", "职场", "神鬼", "奇幻", "生活", "其他"],

                // category或者search
                // 如果为category, 点击后将进入分类漫画页面, 使用下方的`categoryComics`加载漫画
                // 如果为search, 将进入搜索页面
                itemType: "category",

                // 若提供, 数量需要和`categories`一致, `categoryComics.load`方法将会收到此参数
                categoryParams: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "11", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]
            }
        ],
        enableRankingPage: false,
    }

    /// 分类漫画页面, 即点击分类标签后进入的页面
    categoryComics = {
        load: async (category, param, options, page) => {
            return await this.queryComics(
                `filter?channel=pc&app_name=dmzj&version=1.0.0&timestamp=${this.timestamp}&uid&sortType=${options[0]}&page=${page}&size=18&status=${options[1]}&audience=${options[2]}&theme=${param}&cate=${options[3]}&firstLetter${options[4]}`,
                "totalNum",
                "comicList",
                18
            )
        },
        // 提供选项
        optionList: [
            {
                options: [
                    "0-更新时间",
                    "1-热门人气"
                ],
            },
            {
                // 对于单个选项, 使用-分割, 左侧为用于数据加载的值, 即传给load函数的options参数; 右侧为显示给用户的文本
                options: [
                    "0-全部",
                    "1-连载",
                    "2-完结",
                ],
                // 提供[]string, 当分类名称位于此数组中时, 禁用此选项
                notShowWhen: null,
                // 提供[]string, 当分类名称没有位于此数组中时, 禁用此选项
                showWhen: null
            },
            {
                options: [
                    "0-全部",
                    "3262-少年",
                    "3263-少女",
                    "3264-青年",
                ],
            },
            {
                options: [
                    "0-全部",
                    "1-故事漫画",
                    "2-四格多格",
                ],
            },
            {
                options: [
                    "-全部", "=a-A", "=b-B", "=c-C", "=d-D", "=e-E", "=f-F", "=g-G", "=h-H", "=i-I", "=j-J", "=k-K", "=l-L", "=m-M", "=n-N", "=o-O", "=p-P", "=q-Q", "=r-R", "=s-S", "=t-T", "=u-U", "=v-V", "=w-W", "=x-X", "=y-Y", "=z-Z", "=9-0~9",
                ],
            }
        ],
    }

    /// 搜索
    search = {
        load: async (keyword, options, page) => {
            return this.queryComics(
                `search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=20`,
                "total",
                "comic_list",
                20
            )
        },

        // 提供选项
        optionList: []
    }

    /// 收藏
    favorites = null

    /// 单个漫画相关
    comic = {
        // 加载漫画信息
        loadInfo: async (id) => {
            let json = await this.queryJson(
                `comic/detail?channel=pc&app_name=dmzj&version=1.0.0&timestamp=${this.timestamp}&uid&comic_py=${id}`
            )

            let comicInfo = json.data.comicInfo
            let authors = [comicInfo.authorInfo.authorName]
            let types = comicInfo.types ? comicInfo.types : ""
            types = types.split("/")
            let chapterList = {}
            if (comicInfo.chapterList) {
                comicInfo.chapterList[0].data.forEach(element => {
                    let id = element.chapter_id
                    let title = element.chapter_title
                    chapterList[id] = title
                })
            }
            let groupComicList = []
            comicInfo.groupComicList.forEach(element => {
                groupComicList.push({
                    id: element.comic_py,
                    title: element.name,
                    cover: element.cover,
                })
            })

            return {
                title: comicInfo.title,
                cover: comicInfo.cover,
                description: comicInfo.description,
                tags: {
                    "作者": authors,
                    "更新": [comicInfo.lastUpdateChapterName],
                    "标签": types,
                },
                chapters: chapterList,
                recommend: groupComicList,
            }
        },
        // 获取章节图片
        loadEp: async (comicId, epId) => {
            /*
            获取此章节所有的图片url
            ```
            return {
                // string[]
                images: images
            }
            ```
            */
        },
    }
}