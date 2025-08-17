import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreatorPortfolio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/creator/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回儀表板
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">我的作品集</h1>
          <p className="text-gray-600">展示您的創作作品</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>作品集</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">作品集功能開發中</p>
              <Button onClick={() => navigate("/creator/dashboard")}>
                返回儀表板
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
