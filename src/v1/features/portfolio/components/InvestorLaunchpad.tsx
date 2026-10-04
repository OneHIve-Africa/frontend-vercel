import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Sprout, 
  Droplet, 
  Users, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { useUserProfileStore } from "@/v1/features/auth/store/UserProfileStore";
import { HiveRoiCalculator } from "./HiveRoiCalculator";
import { abso, man_hive, manWithApples, LeafInHand } from "@/assets";
import HoneycombPattern from "@/v1/components/common/HoneycombPattern";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I receive my investment returns?",
    answer: "Returns are distributed bi-annually following the major honey harvesting seasons (June/July and December/January). Payouts are transferred directly into your preferred Ghana Mobile Money wallet (MTN MoMo, Telecel Cash) or commercial bank account.",
  },
  {
    question: "What happens if a bee colony absconds or suffers pest damage?",
    answer: "Every hive in the OneHive network is insured and supervised by dedicated field agronomists. If a hive suffers absconding, weather damage, or pest invasion, OneHive replaces and recolonizes the hive at zero additional cost to the investor.",
  },
  {
    question: "How is the honey sold and priced?",
    answer: "OneHive operates guaranteed off-take agreements with certified cosmetic, pharmaceutical, and food-grade packaging distributors. Because the honey is raw, unadulterated, and sustainably harvested, it commands premium domestic and export market pricing.",
  },
  {
    question: "Can I physically visit the apiary where my hives are located?",
    answer: "Absolutely! We organize scheduled investor apiary tours during harvest season in the Volta, Eastern, and Ashanti regions. You can suit up with protective beekeeping gear, observe your hives, and meet the farmers in person.",
  },
];

const STAGES = [
  {
    step: "01",
    title: "Hive Allocation & Siting",
    desc: "Your hives are crafted by local carpenters and sited in verified, high-forage floral belts in Ghana.",
    tag: "Weeks 1 - 2",
  },
  {
    step: "02",
    title: "Swarm Colonization",
    desc: "Targeted organic baiting attracts wild African honeybee swarms (*Apis mellifera adansonii*) to occupy the brood nest.",
    tag: "Weeks 3 - 6",
  },
  {
    step: "03",
    title: "Nectar Flow & Wax Capping",
    desc: "Worker bees forage wild blooms (Shea, Acacia, Citrus), filling frames with raw organic nectar and capping the comb.",
    tag: "Months 3 - 6",
  },
  {
    step: "04",
    title: "Harvest & Cash Distribution",
    desc: "Field officers extract and bottle the honey; profits and your agreed yield dividends are deposited into your wallet.",
    tag: "Every 6 Months",
  },
];

const FARMER_STORIES = [
  {
    name: "Kwesi Mensah",
    region: "Hohoe, Volta Region",
    hives: 15,
    quote: "Beekeeping changed my family's livelihood. In between cassava seasons, honey sales pay my children's school fees on time.",
    image: man_hive,
  },
  {
    name: "Akosua Addo",
    region: "Aburi, Eastern Region",
    hives: 20,
    quote: "The bees increased our orchard fruit yields by 30% through cross-pollination. It's a win-win for our soil and our pockets.",
    image: manWithApples,
  },
  {
    name: "Emmanuel Osei",
    region: "Ejura, Ashanti Region",
    hives: 25,
    quote: "With OneHive providing modern protective gear and training, beekeeping is safe, dignified, and highly rewarding.",
    image: LeafInHand,
  },
];

export const InvestorLaunchpad: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfileStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const firstName = profile?.first_name || "Partner";

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. Page header banner */}
      <div className="relative overflow-hidden bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-7 shadow-sm">
        <HoneycombPattern opacity={0.04} color="#1b9d3c" />
        <img
          src={abso}
          alt=""
          aria-hidden="true"
          className="absolute -right-10 -top-12 w-52 h-52 object-contain opacity-[0.12] pointer-events-none select-none"
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Left: greeting + description */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
              Welcome back, {firstName}
            </p>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Your Hive Investment Portal
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-md leading-relaxed">
              Fund hives, earn bi-annual honey dividends, and support smallholder farmers across Ghana.
            </p>

            {/* Inline key stats */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {[
                { label: "Target APR", value: "22%" },
                { label: "Harvest Cycle", value: "6 months" },
                { label: "Coverage", value: "100% insured" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/80 text-[11px] font-medium text-stone-600"
                >
                  <span className="font-bold text-stone-900">{s.value}</span>
                  <span className="text-stone-400">·</span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/new-investment")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oha_secondary text-white text-sm font-semibold hover:bg-shadsd transition shadow-sm cursor-pointer"
            >
              Fund Your First Hive
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                document.getElementById("simulator-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              Run ROI Simulation
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. OneHive Platform Network Benchmark (No zeroes!) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              OneHive Network Real-Time Impact
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Here is what our growing network of co-investors has achieved across Ghana so far:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-oha_secondary flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">12,450+</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Trees Planted & Protected</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-oha_primary flex items-center justify-center mb-3">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">38.4 Tons</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Pure Wild Honey Produced</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">450+</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Ghanaian Farmers Supported</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">100%</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Guaranteed Off-take Track Record</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive ROI Simulator Section */}
      <div id="simulator-section">
        <HiveRoiCalculator />
      </div>

      {/* 4. 4-Stage Lifecycle Stepper */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-oha_primary">
            Transparency In Action
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            How Your Hive Investment Operates
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            From wooden frame construction in Accra to pure bottled honey sales, follow the lifecycle of your investment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage) => (
            <div 
              key={stage.step}
              className="relative bg-gray-50/70 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between group hover:border-oha_secondary/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-gray-300 group-hover:text-oha_secondary transition">
                    {stage.step}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                    {stage.tag}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">{stage.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{stage.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] font-medium text-oha_secondary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OneHive Managed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Meet Your Beekeepers & Regional Stories */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Meet the Beekeepers on the Ground
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Your capital directly equips these smallholder farmers with hives, gear, and sustainable income.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => navigate("/impact")}
            className="text-xs font-semibold text-oha_secondary hover:text-shadsd inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Explore full impact report</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FARMER_STORIES.map((farmer) => (
            <div 
              key={farmer.name}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
            >
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                <img 
                  src={farmer.image} 
                  alt={farmer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-oha_primary" />
                  <span>{farmer.region}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{farmer.name}</h3>
                    <span className="text-xs font-semibold text-oha_secondary bg-green-50 px-2 py-0.5 rounded-full">
                      {farmer.hives} Hives Managed
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    "{farmer.quote}"
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Certified Beekeeper</span>
                  <span className="font-semibold text-gray-800">Volta / Eastern Cluster</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick FAQ Accordion */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-oha_primary" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Frequently Asked Questions for New Investors
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.question} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-sm text-gray-900 hover:text-oha_secondary transition cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed pr-6">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InvestorLaunchpad;
