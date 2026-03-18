export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          action: string;
          metadata: Json | null;
          performed_by: string;
          target_id: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          action: string;
          metadata?: Json | null;
          performed_by: string;
          target_id: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          action?: string;
          metadata?: Json | null;
          performed_by?: string;
          target_id?: string;
          timestamp?: string;
        };
        Relationships: [];
      };
      candidates: {
        Row: {
          id: string;
          added_at: string;
          added_by: string;
          bio: string;
          category: string;
          department: string;
          election_id: string;
          full_name: string;
          manifesto: string | null;
          photo_url: string | null;
          vote_count: number;
        };
        Insert: {
          id?: string;
          added_at?: string;
          added_by: string;
          bio: string;
          category: string;
          department: string;
          election_id: string;
          full_name: string;
          manifesto?: string | null;
          photo_url?: string | null;
          vote_count?: number;
        };
        Update: {
          id?: string;
          added_at?: string;
          added_by?: string;
          bio?: string;
          category?: string;
          department?: string;
          election_id?: string;
          full_name?: string;
          manifesto?: string | null;
          photo_url?: string | null;
          vote_count?: number;
        };
        Relationships: [];
      };
      elections: {
        Row: {
          id: string;
          created_at: string;
          created_by: string;
          description: string;
          eligible_categories: string[];
          end_date: string;
          start_date: string;
          status: string;
          title: string;
          total_votes: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          created_by: string;
          description: string;
          eligible_categories: string[];
          end_date: string;
          start_date: string;
          status: string;
          title: string;
          total_votes?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          created_by?: string;
          description?: string;
          eligible_categories?: string[];
          end_date?: string;
          start_date?: string;
          status?: string;
          title?: string;
          total_votes?: number;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          category: string;
          created_at: string;
          email: string;
          name: string;
        };
        Insert: {
          id?: string;
          category: string;
          created_at?: string;
          email: string;
          name: string;
        };
        Update: {
          id?: string;
          category?: string;
          created_at?: string;
          email?: string;
          name?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          category: string | null;
          email: string;
          full_name: string;
          is_active: boolean;
          photo_url: string | null;
          registered_at: string;
          role: string;
        };
        Insert: {
          id: string;
          category?: string | null;
          email: string;
          full_name: string;
          is_active?: boolean;
          photo_url?: string | null;
          registered_at?: string;
          role: string;
        };
        Update: {
          id?: string;
          category?: string | null;
          email?: string;
          full_name?: string;
          is_active?: boolean;
          photo_url?: string | null;
          registered_at?: string;
          role?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          candidate_id: string;
          casted_at: string;
          category: string;
          election_id: string;
          receipt_hash: string;
          voter_id: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          casted_at?: string;
          category: string;
          election_id: string;
          receipt_hash: string;
          voter_id: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          casted_at?: string;
          category?: string;
          election_id?: string;
          receipt_hash?: string;
          voter_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      cast_vote_secure: {
        Args: {
          p_candidate_id: string;
          p_category: string;
          p_election_id: string;
          p_receipt_hash: string;
          p_voter_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
