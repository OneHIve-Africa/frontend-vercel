import { useEffect, useState } from "react";
import ImpactApi, { ImpactMetrics } from "@/v1/features/admin/features/impact/api/ImpactApi";
import ImpactStats from "../components/ImpactStats";
import BeeInvestmentCard from "@/v1/components/common/BeeInvestmentCard";
import ImpactStatsSecond from "../components/ImpactStatsSecond";
import CarbonOffsetAndHives from "../components/CarbonOffsetAndHives";
import CommunityImpactCard from "../components/CommunityImpactCard";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import useInvestmentStore from "../../portfolio/store/InvestmentStore";

const ImpactPage = () => {
  const { investments, fetchInvestments } = useInvestmentStore();
  const {
    profile,
    fetchProfile,
    isLoading: profileLoading,
  } = useUserProfileStore();

  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile && !profileLoading) {
      fetchProfile();
    }
    fetchInvestments();
  }, [fetchProfile, profile, profileLoading, fetchInvestments]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await ImpactApi.getInstance().getMetrics();
        if (response.data) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch impact metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="max-w-full px-5">
        {/* Header */}
        <div className=" py-6 mb-5">
          <h1 className="text-xl font-semibold text-gray-800">
            Your Impact at a Glance
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Hello{" "}
            {profile ? `${profile.first_name} ${profile.last_name}` : "..."},
            your investment is making a real difference! Here's how your
            contribution is driving change in communities and the environment.
          </p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Row 1: Total Investments, Farmers Impacted, Households Impacted */}
            <ImpactStats investments={investments} />
            
            {/* Row 2: Hives in Production, Total Honey Produced, Trees Planted */}
            <ImpactStatsSecond 
              investments={investments} 
              honeyProducedTons={metrics?.investor_honey_produced_tons ?? metrics?.total_honey_produced_tons ?? 0}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-2 lg:h-[450px]">
            <BeeInvestmentCard />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch w-full pt-10">
          {/* Row 3: Total Carbon Offset and Regions */}
          <div className="lg:col-span-2 h-full">
            <CarbonOffsetAndHives 
              carbonOffset={metrics?.total_carbon_offset_kg ?? 0}
              regions={metrics?.regions_count ?? 0}
              loading={loading}
            />
          </div>
          
          {/* Community & Economic Impact */}
          <div className="lg:col-span-3 h-full">
            <CommunityImpactCard  
              incomeGHS={metrics?.income_generated ?? 0}
              localJobs={metrics?.local_jobs_created ?? 0}
              hivesReady={metrics?.hives_ready ?? 0} 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImpactPage;
