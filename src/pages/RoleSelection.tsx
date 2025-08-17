import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Hotel, Palette, Radio } from "lucide-react";

const ROLE_SELECTION = {
  supplier: {
    title: "旅遊服務供應商",
    subtitle: "發布行銷任務，尋找創作者",
    icon: "🏨",
    color: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
    features: [
      "發布行銷任務",
      "管理預算與時程",
      "審核創作者提案",
      "追蹤任務效果",
      "與創作者溝通"
    ],
    benefits: [
      "快速找到合適的創作者",
      "專業的內容創作服務",
      "透明的預算控制",
      "完整的任務管理流程"
    ]
  },
  creator: {
    title: "內容創作者",
    subtitle: "接案創作，展現才華",
    icon: "🎨",
    color: "#10B981",
    gradient: "from-green-500 to-green-600",
    features: [
      "瀏覽適合的任務",
      "提交創意提案",
      "創作高品質內容",
      "獲得合理報酬",
      "建立作品集"
    ],
    benefits: [
      "豐富的任務選擇",
      "公平的競爭環境",
      "穩定的收入來源",
      "專業能力提升"
    ]
  },
  media: {
    title: "媒體通路",
    subtitle: "發布內容，觸達受眾",
    icon: "📡",
    color: "#8B5CF6",
    gradient: "from-purple-500 to-purple-600",
    features: [
      "下載高品質素材",
      "多平台內容發布",
      "效果追蹤與分析",
      "與供應商合作",
      "擴大影響力"
    ],
    benefits: [
      "豐富的內容資源",
      "多樣化的發布渠道",
      "專業的數據分析",
      "擴大平台影響力"
    ]
  }
};

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    // 根據角色導航到對應的儀表板
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
      {/* 頁面標題 */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          旅遊創作者媒體平台
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          連接旅遊服務供應商、內容創作者和媒體通路，打造完整的旅遊行銷生態系統
        </p>
        
        {/* 平台統計 */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">活躍供應商</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">2000+</div>
            <div className="text-gray-600">創作者</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">100+</div>
            <div className="text-gray-600">媒體通路</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">5000+</div>
            <div className="text-gray-600">完成任務</div>
          </div>
        </div>
      </div>

      {/* 角色選擇卡片 */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.entries(ROLE_SELECTION).map(([roleKey, role]) => (
            <Card
              key={roleKey}
              className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 overflow-hidden"
            >
              {/* 卡片頭部 */}
              <CardHeader className={`bg-gradient-to-r ${role.gradient} text-white pb-8`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{role.icon}</div>
                  <CardTitle className="text-2xl font-bold mb-2">
                    {role.title}
                  </CardTitle>
                  <p className="text-blue-100 text-sm">
                    {role.subtitle}
                  </p>
                </div>
              </CardHeader>

              {/* 卡片內容 */}
              <CardContent className="pt-8">
                {/* 主要功能 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                    主要功能
                  </h3>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 平台優勢 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }} />
                    平台優勢
                  </h3>
                  <div className="space-y-2">
                    {role.benefits.map((benefit, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="mr-2 mb-2 text-xs"
                        style={{ backgroundColor: `${role.color}15`, color: role.color }}
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 選擇按鈕 */}
                <Button
                  onClick={() => handleRoleSelect(roleKey)}
                  className={`w-full bg-gradient-to-r ${role.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white border-0`}
                  size="lg"
                >
                  <span>選擇 {role.title}</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 平台特色 */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            為什麼選擇我們的平台？
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hotel className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">專業服務</h3>
              <p className="text-gray-600 text-sm">
                專注於旅遊行業，提供專業的內容創作和行銷服務
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">創意無限</h3>
              <p className="text-gray-600 text-sm">
                匯聚眾多創意人才，為您的品牌注入新鮮活力
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">全渠道發布</h3>
              <p className="text-gray-600 text-sm">
                覆蓋各大媒體平台，最大化內容傳播效果
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 text-orange-600 text-2xl">📊</div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">數據驅動</h3>
              <p className="text-gray-600 text-sm">
                完整的數據分析，幫助您做出明智的決策
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 開始使用提示 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            準備好開始您的創意之旅了嗎？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            選擇您的角色，立即體驗專業的旅遊內容創作平台
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            重新選擇角色
          </Button>
        </div>
      </div>
    </div>
  );
}
