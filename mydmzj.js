class MyDMZJ extends ComicSource {  // 首行必须为class...
    // 此漫画源的名称
    name = "动漫之家"

    // 唯一标识符
    key = "mydmzj"

    version = "1.0.0"

    minAppVersion = "4.0.0"

    // 更新链接
    url = "https://raw.githubusercontent.com/xiaoyaoshengy/picacomic_sources/master/mydmzj.js"

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

    async queryComics(query) {
        let json = await this.queryJson(query)

        function parseComic(comic) {
            return {
                id: comic.id.toString(),
                title: comic.name,
                subTitle: comic.authors,
                cover: comic.cover,
                tags: comic.types.split("/"),
                description: comic.status,
            }
        }

        let totalNum = json.data["totalNum"]
        let comicList = totalNum ? json.data["comicList"] : []

        return {
            comics: comicList.map(parseComic),
            maxPage: Math.ceil(totalNum / 18),
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
                let timestamp = new Date().getTime()
                return await this.queryComics(
                    `filter?channel=pc&app_name=dmzj&version=1.0.0&timestamp=${timestamp}&uid&sortType=0&page=${page}&size=18&status=0&audience=0&theme=0&cate=0&firstLetter`
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
            let timestamp = new Date().getTime()
            return await this.queryComics(
                `filter?channel=pc&app_name=dmzj&version=1.0.0&timestamp=${timestamp}&uid&sortType=${options[0]}&page=${page}&size=18&status=${options[1]}&audience=${options[2]}&theme=${param}&cate=${options[3]}&firstLetter${options[4]}`
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
            /*
            加载漫画
            options类型为[]string, 来自下方optionList, 顺序保持一致
            ```
            let data = JSON.parse((await Network.get('...')).body)
            let maxPage = data.maxPage

            function parseComic(comic) {
                // ...

                return {
                    id: id,
                    title: title,
                    subTitle: author,
                    cover: cover,
                    tags: tags,
                    description: description
                }
            }

            return {
                comics: data.list.map(parseComic),
                maxPage: maxPage
            }
            ```
            */
        },

        // 提供选项
        optionList: [
            {
                // 使用-分割, 左侧用于数据加载, 右侧显示给用户
                options: [
                    "0-time",
                    "1-popular"
                ],
                // 标签
                label: "sort"
            }
        ]
    }

    /// 收藏
    favorites = {
        /// 是否为多收藏夹
        multiFolder: false,
        /// 添加或者删除收藏
        addOrDelFavorite: async (comicId, folderId, isAdding) => {
            /*
            返回任意值表示成功
            抛出错误`Login expired`表示登录到期, App将会自动重新登录并且重新加载
            ```
            if (res.status === 401) {
                throw `Login expired`;
            }
            ```
            不需要考虑未登录的情况, 未登录时不会调用此函数
            */
        },
        // 加载收藏夹, 仅当multiFolder为true时有效
        // 当comicId不为null时, 需要同时返回包含该漫画的收藏夹
        loadFolders: async (comicId) => {
            /*
            ```
            let data = JSON.parse((await Network.get('...')).body)

            let folders = {}

            data.folders.forEach((f) => {
                folders[f.id] = f.name
            })

            return {
                // map<string, string> key为收藏夹id, value为收藏夹名称, id用于收藏夹相关内容的加载
                folders: folders,
                // string[]?, 包含comicId的收藏夹, 若comicId为空, 则此字段为空
                favorited: data.favorited
            }
            ```
            */
        },
        /// 加载漫画
        loadComics: async (page, folder) => {
            /*
            加载漫画
            同上, 抛出错误`Login expired`表示登录到期, App将会自动重新登录并且重新加载
            如果为非多收藏夹式, 参数folder为null
            ```
            let data = JSON.parse((await Network.get('...')).body)
            let maxPage = data.maxPage

            function parseComic(comic) {
                // ...

                return {
                    id: id,
                    title: title,
                    subTitle: author,
                    cover: cover,
                    tags: tags,
                    description: description
                }
            }

            return {
                comics: data.list.map(parseComic),
                maxPage: maxPage
            }
            ```
            */
        }
    }

    /// 单个漫画相关
    comic = {
        // 加载漫画信息
        loadInfo: async (id) => {
            /*
            ```
            // ...

            return {
                // string 标题
                title: title,
                // string 封面url
                cover: cover,
                // string
                description: description,
                // Map<string, string[]> | object 标签
                tags: {
                    "作者": authors,
                    "更新": [updateTime],
                    "标签": tags
                },
                // Map<string, string>? | object, key为章节id, value为章节名称
                // 注意: 为了保证章节顺序, 最好使用Map, 使用object不能保证顺序
                chapters: chapters,
                // bool 注意, 如果是多收藏式的网络收藏, 将此项设置为null, 从而可以在漫画详情页面, 对每个单独的收藏夹执行收藏或者取消收藏操作
                isFavorite: isFavorite,
                // string? 
                subId: comicData.uuid,
                // string[]?
                thumbnails: thumbnails
            }
            ```
            */
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
        // 可选, 调整图片加载的行为; 如不需要, 删除此字段
        onImageLoad: (url, comicId, epId) => {
            /*
            ```
            return {
                url: `${url}?id=comicId`,
                // http method
                method: 'GET',
                // any
                data: null,
                headers: {
                    'user-agent': 'pica_comic/v3.1.0',
                },
                // 参数data和返回值均为 `ArrayBuffer`
                // 注意: 使用此字段会导致图片数据被多次复制, 可能影响性能
                onResponse: (data) => {
                    return data
                }
            }
            ```
            */

            return {}
        },
        // [v3.1.4添加] 可选, 调整缩略图(封面, 预览, 头像等)加载的行为; 如不需要, 删除此字段
        onThumbnailLoad: (url) => {
            /*
            ```
            return {
                url: `${url}?id=comicId`,
                // http method
                method: 'GET',
                // any
                data: null,
                headers: {
                    'user-agent': 'pica_comic/v3.1.0',
                },
                // 参数data和返回值均为 `ArrayBuffer`
                // 注意: 使用此字段会导致图片数据被多次复制, 可能影响性能
                onResponse: (data) => {
                    return data
                }
            }
            ```
            */
            return {}
        },
        // 加载评论
        loadComments: async (comicId, subId, page, replyTo) => {
            /*
            ```
            // ...

            return {
                comments: data.results.list.map(e => {
                    return {
                        // string
                        userName: e.user_name,
                        // string
                        avatar: e.user_avatar,
                        // string
                        content: e.comment,
                        // string?
                        time: e.create_at,
                        // number?
                        replyCount: e.count,
                        // string
                        id: e.id,
                    }
                }),
                // number
                maxPage: data.results.maxPage,
            }
            ```
            */
        },
        // 发送评论, 返回任意值表示成功
        sendComment: async (comicId, subId, content, replyTo) => {

        }
    }
}