import { Glean } from "@gleanwork/api-client";

// Load environment variables
const GLEAN_API_TOKEN = process.env.GLEAN_API_TOKEN;
const GLEAN_INSTANCE = process.env.GLEAN_INSTANCE;
const GLEAN_AGENT_ID = process.env.GLEAN_AGENT_ID;
const STANDARD_MSA_LINK = process.env.STANDARD_MSA_LINK || "https://docs.google.com/document/d/YOUR_DOC_ID/edit";

// Validate required environment variables
if (!GLEAN_API_TOKEN || !GLEAN_INSTANCE || !GLEAN_AGENT_ID) {
  console.error("Error: Missing required environment variables");
  console.error("Please ensure the following are set:");
  console.error("  - GLEAN_API_TOKEN");
  console.error("  - GLEAN_INSTANCE");
  console.error("  - GLEAN_AGENT_ID");
  console.error("\nYou can set these in a .env file (see .env.example)");
  process.exit(1);
}

const glean = new Glean({
  apiToken: GLEAN_API_TOKEN,
  instance: GLEAN_INSTANCE,
});

async function run() {
  const contract = `DATAFLOW ANALYTICS PLATFORM SERVICES AGREEMENT

This Services Agreement ("Agreement") is entered into as of January 15, 2025 ("Effective Date") by and between:

Acme Corporation, a Delaware corporation ("Customer")
and
DataFlow Systems Inc., a California corporation ("Vendor")

WHEREAS, Customer desires to use Vendor's analytics platform services; and
WHEREAS, Vendor agrees to provide such services subject to the terms herein.

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. SERVICES AND LICENSE

1.1 License Grant. Vendor grants Customer a limited, non-exclusive license to access and use the DataFlow Analytics Platform ("Platform") for Customer's business purposes. Customer may have up to 100 named users access the Platform.

1.2 Services. Vendor will provide access to the Platform and basic technical support via email during business hours.

1.3 Restrictions. Customer shall not reverse engineer, decompile, or attempt to derive the source code of the Platform. Customer shall not use the Platform for any illegal purposes.

2. FEES AND PAYMENT

2.1 Fees. Customer shall pay Vendor annual fees of $75,000, payable in advance.

2.2 Payment Terms. All invoices are due and payable within fifteen (15) days of invoice date. Late payments will incur interest at 2% per month. Vendor may suspend services if payment is more than 15 days overdue.

2.3 Fee Increases. Vendor reserves the right to increase fees upon thirty (30) days' notice.

3. WARRANTIES

3.1 Limited Warranty. Vendor warrants that the Platform will perform substantially as described in Vendor's marketing materials for a period of thirty (30) days from the Effective Date.

3.2 Disclaimer. EXCEPT AS EXPRESSLY PROVIDED HEREIN, VENDOR MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. VENDOR DOES NOT WARRANT THAT THE PLATFORM WILL BE ERROR-FREE OR UNINTERRUPTED.

4. LIMITATION OF LIABILITY

4.1 Liability Cap. Vendor's total liability under this Agreement shall not exceed $10,000.

4.2 Exclusion of Damages. IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION.

5. INDEMNIFICATION

5.1 Customer Indemnification. Customer shall indemnify, defend, and hold harmless Vendor from any and all third-party claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from Customer's use of the Platform or breach of this Agreement.

5.2 Vendor Indemnification. Vendor shall defend Customer against claims that the Platform infringes third-party intellectual property rights, provided such claims do not arise from Customer's modifications or misuse of the Platform.

6. TERM AND TERMINATION

6.1 Initial Term. This Agreement shall commence on the Effective Date and continue for an initial term of twenty-four (24) months.

6.2 Automatic Renewal. This Agreement will automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least thirty (30) days before the end of the then-current term.

6.3 Termination for Cause. Either party may terminate this Agreement if the other party materially breaches and fails to cure within fifteen (15) days of written notice.

6.4 Effect of Termination. Upon termination, Customer shall immediately cease using the Platform and Vendor shall have no obligation to return Customer data.

7. SUSPENSION RIGHTS

7.1 Suspension. Vendor may suspend Customer's access to the Platform at any time, with or without notice, if Vendor reasonably believes Customer is in breach of this Agreement or if suspension is necessary to protect the Platform or other customers.

7.2 No Liability. Vendor shall have no liability to Customer for any suspension of services under this Section.

8. INTELLECTUAL PROPERTY

8.1 Platform Ownership. Vendor owns all right, title, and interest in the Platform and all related intellectual property.

8.2 Customer Data. Customer grants Vendor a perpetual, worldwide license to use, modify, and create derivative works from Customer data for Vendor's business purposes, including product improvement and analytics.

9. CONFIDENTIALITY

9.1 Confidential Information. Each party agrees to protect the other party's confidential information using reasonable care. This obligation survives for two (2) years after disclosure.

9.2 Exceptions. Confidential information does not include information that: (a) is publicly available; (b) was known prior to disclosure; (c) is independently developed; or (d) is required to be disclosed by law.

10. GENERAL PROVISIONS

10.1 Governing Law. This Agreement shall be governed by the laws of the State of California.

10.2 Dispute Resolution. Any disputes shall be resolved in the state or federal courts located in Santa Clara County, California.

10.3 Amendments. Vendor may modify this Agreement at any time by posting updated terms on its website. Continued use of the Platform constitutes acceptance of such modifications.

10.4 Assignment. Vendor may assign this Agreement without Customer's consent. Customer may not assign this Agreement without Vendor's prior written consent.

10.5 Severability. If any provision is found invalid, the remaining provisions shall remain in effect.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.

ACME CORPORATION                    DATAFLOW SYSTEMS INC.

By: _________________________      By: _________________________
Name: Sarah Johnson                 Name: Michael Chen
Title: VP of Operations             Title: CEO
Date: January 15, 2025              Date: January 15, 2025`;

  console.log("Running Glean agent and waiting for full response...\n");
  console.log(`Instance: ${GLEAN_INSTANCE}`);
  console.log(`Agent ID: ${GLEAN_AGENT_ID}`);
  console.log(`MSA Link: ${STANDARD_MSA_LINK}\n`);
  
  const result = await glean.client.agents.run({
    agentId: GLEAN_AGENT_ID!,
    input: {
      "Customer Contract Text (Provided by Word Add-In)": contract,
      "Link to our standard MSA": STANDARD_MSA_LINK,
    },
  });

  console.log("Agent response received!\n");
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error("Error running agent:", error);
  process.exit(1);
});
