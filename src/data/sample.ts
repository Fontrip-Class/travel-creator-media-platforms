export type Supplier = {
  id: string;
  name: string;
  category: string;
  location: string;
  contact: string;
  description: string;
};

export type Asset = {
  id: string;
  title: string;
  type: string;
  url?: string;
  date?: string;
  description?: string;
};

export type Creator = {
  id: string;
  name: string;
  niches: string[];
  platforms: string[]; // 平台名稱或型態（顯示用）
  contact: string; // email 或 官方網站
  bio: string;
  rating?: number; // 0-5
  ratingCount?: number;
  links?: string[]; // 社群/官網連結（SEO sameAs）
  assets?: Asset[]; // 過往行銷素材
};

export type Media = {
  id: string;
  name: string;
  type: string;
  reach: string;
  contact: string;
  description: string;
};

export const suppliers: Supplier[] = [
  { id: "s-101", name: "海風旅遊 SeaBreeze", category: "海島度假", location: "台北", contact: "contact@seabreeze.tw", description: "提供海島旅遊行程與自由潛水體驗，長期合作創作者方案。" },
  { id: "s-102", name: "山徑探索 TrailX", category: "登山健行", location: "台中", contact: "hi@trailx.com", description: "在地嚮導與多日縱走行程，提供裝備支援。" },
  { id: "s-103", name: "城市品味 CityTales", category: "城市導覽", location: "台南", contact: "hello@citytales.io", description: "文化、飲食、歷史導覽，提供在地職人訪談。" },
  { id: "s-104", name: "九族文化村", category: "主題樂園・纜車・文化園區", location: "南投縣魚池鄉（日月潭）", contact: "https://www.nine.com.tw/", description: "位於日月潭的主題樂園，結合原住民文化展演、歐洲花園、纜車與季節性花季活動，提供園區採訪、活動合作與團體方案。" },
];
export const creators: Creator[] = [
  { id: "c-201", name: "Luna Travel", niches: ["美食","城市","旅拍"], platforms: ["YouTube","Instagram"], contact: "luna@creator.co", bio: "熱愛美食與城市故事，擅長短影片與圖文長文。" },
  { id: "c-202", name: "Outdoor Ken", niches: ["登山","露營"], platforms: ["YouTube","Threads"], contact: "ken@creator.co", bio: "戶外專題與裝備評測，紀錄路線攻略。" },
  { id: "c-203", name: "Diving Mia", niches: ["海島","自由潛水"], platforms: ["Instagram","TikTok"], contact: "mia@creator.co", bio: "藍色星球的追光者，擅長水下攝影。" },
  {
    id: "c-204",
    name: "優尼太太",
    niches: ["料理","生活","親子"],
    platforms: ["YouTube","Instagram","部落格"],
    contact: "https://mrsyuny.com/about/",
    bio: "以料理、生活靈感與親子分享為主題的創作者，擅長以圖文與影音呈現實用教學與美感風格。",
    rating: 4.8,
    ratingCount: 132,
    links: ["https://mrsyuny.com/"],
    assets: [
      {
        id: "a-1",
        title: "家常料理教學：五道快速晚餐",
        type: "圖文",
        url: "https://mrsyuny.com/",
        date: "2024-05",
        description: "以步驟圖文與成品照呈現，社群同步曝光。"
      },
      {
        id: "a-2",
        title: "品牌合作：廚具體驗短片",
        type: "影音",
        date: "2024-08",
        description: "30秒短影音＋IG 限動導流，含拍攝與剪輯。"
      },
      {
        id: "a-3",
        title: "旅遊親子企劃：日月潭一日行",
        type: "圖文/影音",
        date: "2024-10",
        description: "路線建議、景點介紹與親子友善資訊整合。"
      }
    ]
  },
];

export const medias: Media[] = [
  { id: "m-301", name: "旅遊新聞網", type: "新聞媒體", reach: "月瀏覽 120萬", contact: "news@travelnews.tw", description: "提供旅遊產業新聞與專題採訪。" },
  { id: "m-302", name: "城市電視台", type: "電視", reach: "全國覆蓋", contact: "tv@citytv.tw", description: "城市與生活頻道，旅遊節目合作中。" },
  { id: "m-303", name: "冒險雜誌", type: "雜誌/網站", reach: "訂閱 8萬", contact: "editor@adventuremag.com", description: "戶外與極限運動專題，接受素材授權。" },
];
