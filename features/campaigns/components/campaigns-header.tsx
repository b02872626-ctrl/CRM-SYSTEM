"use client";

import { useState } from "react";
import { CreateCampaignModal } from "./create-campaign-modal";
 
type OwnerOption = {
  id: string;
  full_name: string;
};
 
export function CampaignsHeader({ 
  owners, 
  profile 
}: { 
  owners: OwnerOption[];
  profile: { id: string; role: string | null } | null;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = profile?.role === "admin";
 
  return (
    <>
      <div className="crm-page-header">
        <div>
          <p className="crm-page-kicker">Campaigns</p>
          <h2 className="crm-page-title">Campaigns</h2>
          <p className="crm-page-copy">
            Organize outbound focus areas before working companies and deals.
          </p>
        </div>
 
        <div className="flex gap-4 items-center">
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="crm-primary-button"
            >
              Create campaign
            </button>
          )}
        </div>
      </div>

      <CreateCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        owners={owners} 
      />
    </>
  );
}
