import type { SheetData, StrategyInput, AutomateInput, AutomateMode, PowerBIInput, WizardState } from '@/types'

export const SYSTEM_PROMPT = `You are an elite CFO Intelligence Assistant for Ascando Partners.
You specialize in financial analysis, strategic planning, automation blueprints, Power BI architecture,
and KPI framework design for CFOs and finance executives.
Your responses are precise, actionable, and structured with clear headings and bullet points.
Always provide concrete, implementable recommendations tailored to the specific context provided.`

export function buildExcelAnalysisPrompt(sheets: SheetData[], fileName: string): string {
  const sheetSummaries = sheets
    .map((sheet) => {
      const headers = sheet.headers.join(', ')
      const sampleRows = sheet.rows
        .slice(0, 3)
        .map((row) => JSON.stringify(row))
        .join('\n')
      return `**Sheet: ${sheet.name}** (${sheet.rowCount} rows)\nHeaders: ${headers}\nSample data:\n${sampleRows}`
    })
    .join('\n\n')

  return `Analyze this Excel/CSV file uploaded by a CFO or finance professional:

**File:** ${fileName}

${sheetSummaries}

Provide a comprehensive analysis including:
1. **Data Structure Assessment** — what this dataset represents, data quality observations
2. **Key Financial Insights** — patterns, trends, anomalies visible in the structure
3. **CFO Use Cases** — 3-5 specific ways this data can drive financial decisions
4. **Automation Opportunities** — processes that could be automated using this data
5. **Recommended Next Steps** — specific actions the CFO should take with this data
6. **Power BI Dashboard Ideas** — 3 dashboard concepts that would leverage this data`
}

export function buildStrategyPrompt(input: StrategyInput): string {
  const useCasesText = input.useCases.join(', ')
  return `You are advising a ${input.role} in the ${input.industry} industry.

**Primary Challenge:** ${input.challenge}
**AI Use Cases of Interest:** ${useCasesText}

Create a comprehensive CFO AI Strategy Blueprint with:

## 1. Strategic Assessment
- Current state analysis for this industry/role combination
- Key financial pain points AI can solve

## 2. Priority Use Case Roadmap
For each use case identified, provide:
- Business impact (High/Medium/Low)
- Implementation complexity
- Expected ROI timeframe
- Required data inputs

## 3. 90-Day Quick Win Plan
- Week 1-2: Foundation actions
- Week 3-6: Pilot implementation
- Week 7-12: Scale and measure

## 4. Risk & Change Management
- Key risks to address
- Stakeholder communication strategy
- Success metrics and KPIs

## 5. Technology Stack Recommendation
- Core AI tools for finance
- Integration requirements
- Build vs. buy guidance`
}

export function buildAutomatePrompt(input: AutomateInput): string {
  const modeDescriptions: Record<AutomateMode, string> = {
    executive: 'high-level executive summary with strategic implications and key decisions required',
    operational: 'detailed operational blueprint with step-by-step workflow and system integrations',
    technical: 'technical implementation spec with code patterns, API connections, and data pipeline architecture',
  }

  return `Create an automation blueprint for the following financial report/process:

**Description:** ${input.reportDescription}
**Output Mode:** ${modeDescriptions[input.mode]}

${
  input.mode === 'executive'
    ? `## Executive Automation Blueprint

### Current State Cost Analysis
- Estimated manual hours per cycle
- Error rate and rework costs
- Opportunity cost of delayed insights

### Automation ROI Projection
- Year 1, Year 2, Year 3 projections
- Payback period estimate

### Strategic Recommendation
- Go/no-go recommendation with rationale
- Key dependencies and prerequisites
- Executive action items`
    : input.mode === 'operational'
      ? `## Operational Automation Blueprint

### Process Map
Step-by-step current vs. automated workflow

### Data Sources & Triggers
- Input data sources and formats
- Automation triggers and schedules

### Workflow Steps
Detailed numbered workflow with owner and system for each step

### Exception Handling
- Error scenarios and fallback procedures
- Escalation paths

### Testing & Validation Checklist
- UAT scenarios
- Data validation rules`
      : `## Technical Implementation Spec

### Architecture Overview
- System components diagram (described in text)
- Data flow specification

### Data Pipeline
\`\`\`
Source → Transform → Load → Report
\`\`\`
With specific tools, APIs, and code patterns

### Key Code Patterns
Provide pseudo-code or actual code snippets for critical automations

### API & Integration Specs
- Required API connections
- Authentication methods
- Rate limits and error handling

### Infrastructure Requirements
- Compute, storage, scheduling
- Monitoring and alerting setup`
}`
}

export function buildPowerBIPrompt(input: PowerBIInput): string {
  return `Design a complete Power BI solution for a CFO dashboard:

**Source System:** ${input.sourceSystem}
**Business Domain:** ${input.domain}
**Business Questions to Answer:** ${input.businessQuestions}

Provide:

## 1. Star Schema Design

### Fact Tables
For each fact table, specify:
- Table name
- Grain (one row represents...)
- Key measures (with DAX formulas)
- Foreign keys

### Dimension Tables
For each dimension, specify:
- Table name
- Key attributes
- Hierarchy levels
- SCD type recommendation

## 2. DAX Measure Library

Provide production-ready DAX for the 10 most important KPIs including:
\`\`\`dax
Measure Name =
    DAX formula here
\`\`\`

## 3. Report Pages Specification

For each recommended report page:
- Page name and purpose
- Visual types and their fields
- Filter/slicer requirements
- Drill-through paths

## 4. Data Refresh & Performance
- Recommended refresh schedule
- Key optimization techniques
- Row-level security design

## 5. Implementation Roadmap
- Phase 1: Core model (Week 1-2)
- Phase 2: Calculated measures (Week 3)
- Phase 3: Reports & governance (Week 4)`
}

export function buildWizardPrompt(state: WizardState): string {
  return `Design a complete KPI metric specification for a CFO:

**Metric Type:** ${state.metricType}
**Business Domain:** ${state.domain}
**Reporting Frequency:** ${state.frequency}
**Target Audience:** ${state.audience}

Create a comprehensive metric specification:

## 1. Metric Definition
- Formal metric name
- Plain English definition
- Business purpose and strategic alignment

## 2. Technical Specification
\`\`\`
Formula: [exact calculation]
Numerator: [data element]
Denominator: [data element]
Unit: [%, $, #, days, etc.]
\`\`\`

## 3. Data Requirements
- Source systems and tables
- Required fields and transformations
- Data quality rules

## 4. Target Setting Framework
- Baseline calculation method
- Target-setting methodology (% improvement, benchmark, etc.)
- Threshold definitions (Red/Amber/Green)

## 5. Reporting Template
- Visualization type recommendation
- Contextual dimensions to include
- Comparison periods

## 6. Governance
- Metric owner
- Review cadence
- Change control process
- Related metrics (leading/lagging indicators)`
}

export function buildSandboxSystemPrompt(context: string): string {
  return `${SYSTEM_PROMPT}

${context ? `Session Context:\n${context}\n` : ''}
You are in an interactive CFO advisory session. Provide expert financial guidance,
answer follow-up questions, and help the user explore financial strategies and analytics.
Be conversational but authoritative.`
}
