import { CampaignHeader } from "./campaign-header";
import { CampaignStats } from "./campaign-stats";
import { CampaignTabController } from "./campaign-tab-controller";
import { CampaignAbout } from "./campaign-about";
import { CampaignLeadsSection } from "./campaign-leads-section";
import { SidebarTitle } from "@/components/layout/sidebar-context";

type CampaignDetailProps = {
  campaign: {
    id: string;
    name: string;
    description: string | null;
    campaign_type: string | null;
    target_audience: string | null;
    status: string;
    owner_id: string | null;
    owner: { id: string; full_name: string; email: string | null } | null;
    start_date: string | null;
    end_date: string | null;
    notes: string | null;
  };
  linkedCompanies: Array<{
    id: string;
    company_id: string;
    campaign_status: string | null;
    interest_level: string | null;
    added_at: string | null;
    notes: string | null;
    company: {
      id: string;
      name: string;
      industry: string | null;
      company_size: string | null;
      location: string | null;
      source: string | null;
      priority: string | null;
      status: string;
      website: string | null;
      notes: string | null;
      hiring_signal: string | null;
      contacts: Array<{
        id: string;
        full_name: string;
        role_title: string | null;
        email: string | null;
        phone: string | null;
      }>;
    } | null;
    primary_contact: {
      full_name: string;
      role_title: string | null;
      email: string | null;
      phone: string | null;
    } | null;
    deal_count: number;
  }>;
  linkedCompaniesTotal: number;
  linkedCompaniesPageSize: number;
  currentPage: number;
  availableCompanies: Array<{
    id: string;
    name: string;
    industry: string | null;
  }>;
  metrics: {
    linkedCompanyCount: number;
    qualifiedCompanyCount: number;
    dealsCreatedCount: number;
  };
  searchQuery?: string;
};

export function CampaignDetail({
  campaign,
  linkedCompanies,
  linkedCompaniesTotal,
  linkedCompaniesPageSize,
  currentPage,
  availableCompanies,
  metrics,
  searchQuery
}: CampaignDetailProps) {
  return (
    <section className="crm-page">
      <SidebarTitle title={campaign.name} />
      <CampaignHeader campaign={campaign} />
      
      <CampaignStats metrics={metrics} />

      <CampaignTabController
        aboutSection={<CampaignAbout campaign={campaign} />}
        leadsSection={
          <CampaignLeadsSection
            campaignId={campaign.id}
            linkedCompanies={linkedCompanies}
            linkedCompaniesTotal={linkedCompaniesTotal}
            linkedCompaniesPageSize={linkedCompaniesPageSize}
            currentPage={currentPage}
            availableCompanies={availableCompanies}
            searchQuery={searchQuery}
          />
        }
      />
    </section>
  );
}

