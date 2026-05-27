export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          description: string | null;
          type: 'fixed' | 'installment' | 'variable';
          created_at: string;
          payment_status: 'paid' | 'pending';
          due_day: number | null;
          is_recurring: boolean;
          total_amount: number | null;
          installment_amount: number | null;
          total_installments: number | null;
          current_installment: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          description?: string | null;
          type?: 'fixed' | 'installment' | 'variable';
          created_at?: string;
          payment_status?: 'paid' | 'pending';
          due_day?: number | null;
          is_recurring?: boolean;
          total_amount?: number | null;
          installment_amount?: number | null;
          total_installments?: number | null;
          current_installment?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          category?: string;
          date?: string;
          description?: string | null;
          type?: 'fixed' | 'installment' | 'variable';
          created_at?: string;
          payment_status?: 'paid' | 'pending';
          due_day?: number | null;
          is_recurring?: boolean;
          total_amount?: number | null;
          installment_amount?: number | null;
          total_installments?: number | null;
          current_installment?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'expenses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          source: string;
          date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          source: string;
          date: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          source?: string;
          date?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'incomes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          target: number;
          current: number | null;
          deadline: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          target: number;
          current?: number | null;
          deadline?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          target?: number;
          current?: number | null;
          deadline?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'goals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
