import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Hotel, Palette, Radio } from "lucide-react";

const ROLE_SELECTION = {
  supplier: {
    title: "旅遊供應商",
    subtitle: "提供旅遊服務、景點門票、住宿等服務",
    icon: "🏨",
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    features: [
      "景點門票管理",
      "住宿服務預訂",
      "旅遊行程規劃",
      "客戶服務支援",
      "營收數據分析"
    ],
    benefits: [
      "擴大市場曝光度",
      "提升品牌知名度",
      "增加客戶來源",
      "優化營運效率"
    ]
  },
  creator: {
    title: "內容創作者",
    subtitle: "創作旅遊內容，分享旅遊經驗",
    icon: "🎨",
    color: "#10B981",
    gradient: "from-green-500 to-green-600",
    features: [
      "旅遊攻略創作",
      "景點推薦分享",
      "美食文化介紹",
      "攝影作品展示",
      "個人品牌建立"
    ],
    benefits: [
      "獲得創作報酬",
      "建立個人影響力",
      "拓展合作機會",
      "提升專業技能"
    ]
  },
  media: {
    title: "媒體平台",
    subtitle: "協助品牌與創作者建立合作關係",
    icon: "📺",
    color: "#8B5CF6",
    gradient: "from-purple-500 to-purple-600",
    features: [
      "內容推廣服務",
      "品牌合作媒合",
      "市場推廣策略",
      "數據分析報告",
      "創意行銷方案"
    ],
    benefits: [
      "擴大平台影響力",
      "增加廣告收入",
      "提升用戶體驗",
      "建立產業生態"
    ]
  }
};

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    // 根據選擇的角色導航到對應的儀表板
    switch (role) {
      case "supplier":
        navigate("/supplier/dashboard");
        break;
      case "creator":
        navigate("/creator/dashboard");
        break;
      case "media":
        navigate("/media/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 主要標題 */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          選擇您的角色
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          無論您是旅遊供應商、內容創作者還是媒體平台，我們都能為您提供最適合的服務和解決方案
        </p>
        
        {/* 平台特色 */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hotel className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">供應商</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">創作者</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">媒體</p>
          </div>
        </div>
      </div>

      {/* 角色選擇卡片 */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-3">
          {Object.entries(ROLE_SELECTION).map(([key, role]) => (
            <Card key={key} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="text-center pb-6">
                <div className="text-6xl mb-4">{role.icon}</div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {role.title}
                </CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  {role.subtitle}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 主要功能 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">主要功能</h4>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 主要優勢 */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">主要優勢</h4>
                  <ul className="space-y-2">
                    {role.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 選擇按鈕 */}
                <Button
                  onClick={() => handleRoleSelect(key)}
                  className={`w-full bg-gradient-to-r ${role.gradient} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  size="lg"
                >
                  選擇此角色
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 底部說明 */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            不確定選擇哪個角色？
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            您可以隨時在個人設定中更改角色，或者聯繫我們的客服團隊獲得專業建議
          </p>
          <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
            聯繫客服
          </Button>
        </div>
      </div>
    </div>
  );
}

