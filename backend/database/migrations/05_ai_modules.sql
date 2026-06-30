-- 05_ai_modules.sql
-- AI Modules Database Support

-- -----------------------------------------------------
-- 1. Prompt Management Table
-- -----------------------------------------------------
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    template TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT chk_prompts_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_prompts_name ON public.prompts(name);

-- -----------------------------------------------------
-- 2. AI Execution Audit Logs Table
-- -----------------------------------------------------
CREATE TABLE public.ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    prompt_name VARCHAR(100),
    input_parameters JSONB NOT NULL,
    response_content TEXT NOT NULL,
    tokens_used INT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0.00 AND 100.00),
    latency_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE INDEX idx_ai_logs_endpoint ON public.ai_logs(endpoint);
CREATE INDEX idx_ai_logs_user ON public.ai_logs(user_id);

-- -----------------------------------------------------
-- 3. Conversational Context Memory Table
-- -----------------------------------------------------
CREATE TABLE public.context_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    memory_key VARCHAR(255) NOT NULL,
    memory_value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    soft_delete BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uniq_session_memory UNIQUE (session_id, memory_key)
);

CREATE INDEX idx_context_memory_session ON public.context_memory(session_id);

-- -----------------------------------------------------
-- Triggers for Audit Fields & Updated At
-- -----------------------------------------------------

DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['prompts', 'ai_logs', 'context_memory'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t);
        
        EXECUTE format('
            CREATE TRIGGER set_%I_audit_fields
            BEFORE INSERT OR UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION set_record_audit_fields();
        ', t, t);
    END LOOP;
END;
$$;

-- -----------------------------------------------------
-- Row Level Security (RLS) Policies
-- -----------------------------------------------------

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_memory ENABLE ROW LEVEL SECURITY;

-- Prompts Policies
CREATE POLICY "Prompts read by all authenticated" ON public.prompts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Prompts managed by Super Admin" ON public.prompts FOR ALL USING (public.is_admin());

-- AI Logs Policies
CREATE POLICY "AI logs select by Admin" ON public.ai_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "AI logs insert by authenticated" ON public.ai_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "AI logs write by Admin" ON public.ai_logs FOR UPDATE USING (public.is_admin());

-- Context Memory Policies
CREATE POLICY "Context memory select self" ON public.context_memory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Context memory manage self" ON public.context_memory FOR ALL USING (auth.role() = 'authenticated');

-- -----------------------------------------------------
-- Seed Default Prompt Templates
-- -----------------------------------------------------

-- Netra Chat Assistant Prompt
INSERT INTO public.prompts (name, template, description) VALUES
('assistant_system_prompt', 
'You are Netra, the AI District Health Intelligence Officer for Devgarh District.
Ground your answers strictly on the current district data:
Clinics: {{PHCS_JSON}}
Medicines Stocks: {{STOCKS_JSON}}
Recent Local Outbreaks: {{OUTBREAKS_JSON}}
Be concise, professional, and explain the data clearly when asked.', 
'System prompt instructions for Netra conversational AI assistant.')
ON CONFLICT (name) DO UPDATE SET template = EXCLUDED.template;

-- Public Health Scenario Simulator Prompt
INSERT INTO public.prompts (name, template, description) VALUES
('simulation_prompt', 
'Simulate the public health scenario "{{SCENARIO_NAME}}" with custom parameters {{CUSTOM_PARAMETERS}} for the following facilities: {{FACILITIES_JSON}}.
Current medicine stocks data: {{STOCKS_JSON}}.
Return estimated medicine demands, staff count surges, bed occupancies, suggested redistribution transfers, and a confidence score.
The response must be valid JSON matching this schema strictly:
{
  "estimatedMedicineDemand": { "[medicineId]": number },
  "estimatedStaffRequirement": number,
  "estimatedBedRequirement": number,
  "suggestedTransfers": [
     { "sourcePhcId": "string", "targetPhcId": "string", "medicineId": "string", "quantity": number }
  ],
  "confidenceScore": number,
  "riskAnalysis": "string"
}', 
'Prompt for Scenario Simulation containing the expected output JSON structure.')
ON CONFLICT (name) DO UPDATE SET template = EXCLUDED.template;

-- Supply Chain Recommendation Engine Prompt
INSERT INTO public.prompts (name, template, description) VALUES
('recommendation_prompt', 
'Analyze medicine stock levels, critical shortages, and surpluses across PHCs in Devgarh District.
Shortages & Thresholds: {{SHORTAGES_JSON}}
All Stocks: {{STOCKS_JSON}}
Core Master Catalog: {{MASTER_CATALOG_JSON}}
Identify matching surplus stocks that can resolve critical shortages via redistribution.
Generate suggested transfer recommendations. The response must be valid JSON matching this schema:
[
  {
    "sourcePhcId": "string",
    "targetPhcId": "string",
    "medicineId": "string",
    "quantity": number,
    "confidence": number,
    "reasoning": "string"
  }
]
Ground your reasoning on stock counts and geographic closeness. Be concise.', 
'Prompt template for AI recommendation engine to generate stock transfer proposals.')
ON CONFLICT (name) DO UPDATE SET template = EXCLUDED.template;

-- Outbreak Forecasting Monitor Prompt
INSERT INTO public.prompts (name, template, description) VALUES
('outbreak_prediction_prompt', 
'Analyze recent disease outbreaks counts and case registry histories in Devgarh District:
Historical Disease Cases: {{HISTORICAL_CASES_JSON}}
PHC Roster Details: {{PHCS_JSON}}
Forecast potential outbreak trends for the next 30 days. Identify risk index, severity, and forecast outbreak dates.
The response must be valid JSON matching this schema:
[
  {
    "phcId": "string",
    "diseaseName": "string",
    "probability": number,
    "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "predictedOutbreakDate": "YYYY-MM-DD"
  }
]
Confidence levels must be between 0.00 and 100.00.', 
'Prompt template for disease outbreaks predictions forecasting.')
ON CONFLICT (name) DO UPDATE SET template = EXCLUDED.template;
