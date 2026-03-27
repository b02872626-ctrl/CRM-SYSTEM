export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole = "admin" | "sales";
export type CompanyStatus =
  | "target"
  | "researching"
  | "contacted"
  | "qualified"
  | "inactive";
export type ContactStatus = "active" | "unresponsive" | "do_not_contact";
export type DealStage =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";
export type DealSeniority = "junior" | "mid" | "senior" | "lead" | "executive";
export type DealUrgency = "low" | "medium" | "high" | "critical";
export type CandidateStage =
  | "sourced"
  | "screening"
  | "interview"
  | "shortlisted"
  | "placed"
  | "rejected"
  | "on_hold";
export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "submitted"
  | "offer"
  | "placed"
  | "rejected"
  | "withdrawn";
export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "status_change"
  | "task";
export type CampaignStatus =
  | "Draft"
  | "Active"
  | "Paused"
  | "Completed"
  | "Archived";

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: ActivityType;
          candidate_application_id: string | null;
          candidate_id: string | null;
          company_id: string | null;
          completed_at: string | null;
          contact_id: string | null;
          created_at: string;
          deal_id: string | null;
          details: string | null;
          due_at: string | null;
          id: string;
          profile_id: string | null;
          summary: string;
          updated_at: string;
        };
        Insert: {
          activity_type: ActivityType;
          candidate_application_id?: string | null;
          candidate_id?: string | null;
          company_id?: string | null;
          completed_at?: string | null;
          contact_id?: string | null;
          created_at?: string;
          deal_id?: string | null;
          details?: string | null;
          due_at?: string | null;
          id?: string;
          profile_id?: string | null;
          summary: string;
          updated_at?: string;
        };
        Update: {
          activity_type?: ActivityType;
          candidate_application_id?: string | null;
          candidate_id?: string | null;
          company_id?: string | null;
          completed_at?: string | null;
          contact_id?: string | null;
          created_at?: string;
          deal_id?: string | null;
          details?: string | null;
          due_at?: string | null;
          id?: string;
          profile_id?: string | null;
          summary?: string;
          updated_at?: string;
        };
      };
      candidate_applications: {
        Row: {
          applied_at: string;
          assigned_profile_id: string | null;
          candidate_id: string;
          created_at: string;
          deal_id: string;
          id: string;
          last_stage_at: string;
          notes: string | null;
          status: ApplicationStatus;
          updated_at: string;
        };
        Insert: {
          applied_at?: string;
          assigned_profile_id?: string | null;
          candidate_id: string;
          created_at?: string;
          deal_id: string;
          id?: string;
          last_stage_at?: string;
          notes?: string | null;
          status?: ApplicationStatus;
          updated_at?: string;
        };
        Update: {
          applied_at?: string;
          assigned_profile_id?: string | null;
          candidate_id?: string;
          created_at?: string;
          deal_id?: string;
          id?: string;
          last_stage_at?: string;
          notes?: string | null;
          status?: ApplicationStatus;
          updated_at?: string;
        };
      };
      campaign_companies: {
        Row: {
          added_at: string;
          campaign_id: string;
          campaign_status: string | null;
          interest_level: string | null;
          company_id: string;
          created_at: string;
          id: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          added_at?: string;
          campaign_id: string;
          campaign_status?: string | null;
          interest_level?: string | null;
          company_id: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          added_at?: string;
          campaign_id?: string;
          campaign_status?: string | null;
          interest_level?: string | null;
          company_id?: string;
          created_at?: string;
          id?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          campaign_type: string | null;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          name: string;
          notes: string | null;
          owner_id: string | null;
          start_date: string | null;
          status: CampaignStatus;
          target_audience: string | null;
          updated_at: string;
        };
        Insert: {
          campaign_type?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          owner_id?: string | null;
          start_date?: string | null;
          status?: CampaignStatus;
          target_audience?: string | null;
          updated_at?: string;
        };
        Update: {
          campaign_type?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          owner_id?: string | null;
          start_date?: string | null;
          status?: CampaignStatus;
          target_audience?: string | null;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          assigned_profile_id: string | null;
          created_at: string;
          current_title: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          linkedin_url: string | null;
          location: string | null;
          notes: string | null;
          phone: string | null;
          source: string | null;
          stage: CandidateStage;
          updated_at: string;
        };
        Insert: {
          assigned_profile_id?: string | null;
          created_at?: string;
          current_title?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          linkedin_url?: string | null;
          location?: string | null;
          notes?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: CandidateStage;
          updated_at?: string;
        };
        Update: {
          assigned_profile_id?: string | null;
          created_at?: string;
          current_title?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          linkedin_url?: string | null;
          location?: string | null;
          notes?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: CandidateStage;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          company_name: string;
          company_size: string | null;
          country: string | null;
          created_at: string;
          hiring_signal: string | null;
          id: string;
          industry: string | null;
          location: string | null;
          notes: string | null;
          owner_id: string | null;
          priority: string | null;
          source: string | null;
          status: CompanyStatus;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          company_name: string;
          company_size?: string | null;
          country?: string | null;
          created_at?: string;
          hiring_signal?: string | null;
          id?: string;
          industry?: string | null;
          location?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          priority?: string | null;
          source?: string | null;
          status?: CompanyStatus;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          company_name?: string;
          company_size?: string | null;
          country?: string | null;
          created_at?: string;
          hiring_signal?: string | null;
          id?: string;
          industry?: string | null;
          location?: string | null;
          notes?: string | null;
          owner_id?: string | null;
          priority?: string | null;
          source?: string | null;
          status?: CompanyStatus;
          updated_at?: string;
          website?: string | null;
        };
      };
      contacts: {
        Row: {
          company_id: string;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          role_title: string | null;
          linkedin_url: string | null;
          notes: string | null;
          owner_profile_id: string | null;
          phone: string | null;
          status: ContactStatus;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          role_title?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
          owner_profile_id?: string | null;
          phone?: string | null;
          status?: ContactStatus;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          role_title?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
          owner_profile_id?: string | null;
          phone?: string | null;
          status?: ContactStatus;
          updated_at?: string;
        };
      };
      deals: {
        Row: {
          assigned_profile_id: string | null;
          company_id: string;
          created_at: string;
          currency: string;
          expected_close_date: string | null;
          id: string;
          number_of_hires: number;
          notes: string | null;
          primary_contact_id: string | null;
          seniority: DealSeniority;
          stage: DealStage;
          title: string;
          updated_at: string;
          urgency: DealUrgency;
          value: number | null;
        };
        Insert: {
          assigned_profile_id?: string | null;
          company_id: string;
          created_at?: string;
          currency?: string;
          expected_close_date?: string | null;
          id?: string;
          number_of_hires?: number;
          notes?: string | null;
          primary_contact_id?: string | null;
          seniority?: DealSeniority;
          stage?: DealStage;
          title: string;
          updated_at?: string;
          urgency?: DealUrgency;
          value?: number | null;
        };
        Update: {
          assigned_profile_id?: string | null;
          company_id?: string;
          created_at?: string;
          currency?: string;
          expected_close_date?: string | null;
          id?: string;
          number_of_hires?: number;
          notes?: string | null;
          primary_contact_id?: string | null;
          seniority?: DealSeniority;
          stage?: DealStage;
          title?: string;
          updated_at?: string;
          urgency?: DealUrgency;
          value?: number | null;
        };
      };
      profiles: {
        Row: {
          auth_user_id: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          role_title: string | null;
          role: ProfileRole;
          updated_at: string;
        };
        Insert: {
          auth_user_id?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          role_title?: string | null;
          role?: ProfileRole;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          role_title?: string | null;
          role?: ProfileRole;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      activity_type: ActivityType;
      application_status: ApplicationStatus;
      candidate_stage: CandidateStage;
      company_status: CompanyStatus;
      contact_status: ContactStatus;
      deal_seniority: DealSeniority;
      deal_stage: DealStage;
      deal_urgency: DealUrgency;
      profile_role: ProfileRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
