# Demo Contract Documents

This directory contains two contract documents designed to demonstrate all change recommendation types in the AI Contract Reviewer.

## Files

### 1. `standard-msa.txt` - Reference Template
This is our ideal Master Services Agreement template that represents customer-favorable terms. It includes:

- **Comprehensive coverage**: All standard clauses for software/SaaS agreements
- **Strong protections**: Robust liability caps ($100K), warranties (1 year), audit rights
- **Customer-favorable terms**: Net 30 payment, 90-day termination notice, mutual indemnification
- **Modern requirements**: Data privacy/GDPR, SLAs with penalties, disaster recovery, security requirements
- **Professional structure**: 13 sections covering all key areas

### 2. `customer-contract.txt` - Contract to Review
This is a vendor-provided contract (DataFlow Systems Inc.) that has multiple issues requiring redlining. It's designed to trigger all change types:

**Problematic Terms (will trigger REPLACE changes):**
- Liability cap: $10,000 (should be $100,000)
- Payment terms: Net 15 (should be Net 30)
- Warranty period: 30 days (should be 1 year)
- Termination notice: 30 days (should be 90 days)
- Late payment interest: 2% per month (should be 1.5%)

**Missing Clauses (will trigger INSERT/ADD_CLAUSE changes):**
- No Service Level Agreements (SLAs)
- No data privacy/security requirements
- No audit rights
- No disaster recovery provisions
- No force majeure clause
- Weak IP ownership language

**Problematic Clauses (will trigger DELETE changes):**
- Section 7.1: "Vendor may suspend at any time without notice" (too broad)
- Section 8.2: Perpetual license to use customer data (unacceptable)
- Section 10.4: Unilateral amendment rights via website posting

**One-sided Terms:**
- Section 5.1: One-sided indemnification favoring vendor
- Section 10.5: Vendor can assign freely, customer cannot

## Expected Change Types

When the AI analyzes `customer-contract.txt` against `standard-msa.txt`, it should recommend:

1. **REPLACE** - Fix specific values and terms:
   - Liability cap: "$10,000" → "$100,000"
   - Payment terms: "fifteen (15) days" → "thirty (30) days"
   - Warranty: "thirty (30) days" → "one (1) year"
   - Termination notice: "thirty (30) days" → "ninety (90) days"

2. **DELETE** - Remove problematic clauses:
   - Suspension without notice clause
   - Perpetual data license clause
   - Unilateral amendment clause

3. **INSERT** - Add missing text within existing sections:
   - Add SLA commitments
   - Add security requirements
   - Add audit rights language

4. **ADD_CLAUSE** - Add entirely new sections:
   - Service Level Agreements section
   - Data Privacy and Security section
   - Audit Rights section
   - Disaster Recovery section
   - Force Majeure section

## Usage

### In Word Add-in Demo:
1. Copy the content from `customer-contract.txt` into a Word document
2. Open the AI Contract Reviewer add-in
3. Configure with your Glean Agent settings
4. Click "Analyze Document"
5. The agent will compare against the standard MSA and recommend changes

### In Test Script:
The `test-glean-short-with-link.ts` file has been updated to use the customer contract content for testing the Glean API directly.

## Contract Parties

**Customer Contract:**
- Customer: Acme Corporation (Delaware)
- Vendor: DataFlow Systems Inc. (California)
- Service: DataFlow Analytics Platform
- Date: January 15, 2025

**Standard MSA:**
- Generic template with placeholders
- Designed for software/SaaS services
- Customer-favorable terms

## Demo Scenario

This represents a realistic scenario where:
1. A vendor (DataFlow) sends us their standard contract
2. We need to redline it to match our standard MSA terms
3. The AI identifies all problematic terms and missing protections
4. Legal team can review AI recommendations and apply changes with track changes

The contracts are intentionally designed to showcase the full capabilities of the AI Contract Reviewer across all change types.
