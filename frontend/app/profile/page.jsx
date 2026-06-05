// FILE: app/profile/page.jsx
"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import TopicRadar from "@/components/profile/TopicRadar";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import { RatingLineChart } from "@/components/dashboard/RatingChart";
import RecentSubmissions from "@/components/dashboard/RecentSubmissions";

export default function ProfilePage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Profile Header + Connected Platforms */}
        <ProfileHeader />

        {/* Heatmap */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Unified Activity Heatmap
          </h2>
          <ActivityHeatmap />
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <TopicRadar />
          <RatingLineChart />
        </div>

        {/* Recent Submissions */}
        <div className="mt-8">
          <RecentSubmissions />
        </div>
      </div>
    </div>
  );
}
