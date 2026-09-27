---
title: "EchoLeak: Leaking data from Microsoft 365 Copilot with a single email"
date: 2026-09-27
summary: "Aim Labs showed that M365 Copilot could follow hidden instructions in an incoming email and carry internal data out of the organisation without the user clicking anything. Microsoft fixed it server-side."
incident_date: 2025-06-11
org: "Microsoft 365 Copilot"
severity: critical
cvss: "9.3"
status: confirmed
cve: "CVE-2025-32711"
buckets: ["ai-system-vulnerability"]
owasp: ["LLM01", "LLM02", "LLM05"]
atlas: ["AML.T0051.001", "AML.T0068", "AML.T0057", "AML.T0077"]
sources:
  - publisher: "Microsoft MSRC"
    title: "CVE-2025-32711: M365 Copilot Information Disclosure Vulnerability"
    date: "2025-06-11"
    url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2025-32711"
  - publisher: "CVE Program"
    title: "CVE-2025-32711 record (CVSS 3.1 vector, CWE-74)"
    date: "2025-06-11"
    url: "https://www.cve.org/CVERecord?id=CVE-2025-32711"
  - publisher: "Aim Labs (Aim Security)"
    title: "EchoLeak: original disclosure and attack chain"
    date: "2025-06-11"
    url: "https://www.aim.security/lp/aim-labs-echoleak-blogpost"
  - publisher: "Reddy & Gujral, arXiv:2509.10540"
    title: "EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System"
    date: "2025-09"
    url: "https://arxiv.org/abs/2509.10540"
  - publisher: "OWASP GenAI Security Project"
    title: "OWASP Top 10 for LLM Applications 2025"
    url: "https://genai.owasp.org/llm-top-10/"
  - publisher: "MITRE ATLAS"
    title: "AML.T0051.001 LLM Prompt Injection: Indirect"
    url: "https://atlas.mitre.org/techniques/AML.T0051.001"
---

## What happened

In June 2025, Aim Labs, the research team at Aim Security, published a flaw in Microsoft 365 Copilot that they called **EchoLeak** [[1]](#src-1) [[3]](#src-3). All an attacker had to do was send an email to someone in the target organisation. The victim did not need to open it, click a link or ask Copilot about it. Later, when the user asked Copilot an ordinary work question, Copilot pulled the email's instructions into its context and produced an answer that carried internal data to the attacker's server.

Microsoft assigned **CVE-2025-32711**, rated it critical (CVSS 3.1: 9.3) and fixed it server-side. Customers did not need to do anything. No exploitation in the wild was reported [[1]](#src-1) [[4]](#src-4).

| Date | Event |
|---|---|
| January 2025 | Aim Labs finds the flaw and reports it to Microsoft (MSRC) [[4]](#src-4) |
| 9 April 2025 | CVE ID reserved [[2]](#src-2) |
| May 2025 | Microsoft rolls out the server-side fix [[4]](#src-4) |
| 11 June 2025 | CVE and the Aim Labs write-up go public [[1]](#src-1) [[3]](#src-3) |
| September 2025 | An academic paper analysing the full chain is published [[4]](#src-4) |

## The threat

- **Who attacks:** anyone who can send the organisation an email. No account, password or internal access. The CVSS vector records this as `PR:N` (no privileges) and `UI:N` (no user interaction) [[2]](#src-2).
- **What is reachable:** everything Copilot can read on that user's behalf: mail, OneDrive files, SharePoint content, Teams chats [[3]](#src-3) [[4]](#src-4). The attacker never touches the data directly. Copilot collects it and carries it out.
- **Worst case:** a confidential document the user can access (an acquisition plan, a customer list, an access key left in a file) leaves the organisation through one email, unnoticed. The user sees no warning. The logs show only an ordinary Copilot conversation.

## Where the flaw was

There was no single bug; four separate defences failed in a row. Aim Labs named the design flaw underneath them an **LLM Scope Violation**: untrusted external text (the attacker's email) enters the same context window as the user's privileged data, and the model cannot tell them apart [[3]](#src-3) [[4]](#src-4).

1. **The prompt-injection classifier was bypassed.** Microsoft's XPIA (cross-prompt injection attack) classifier existed to catch content that tries to instruct the model. When the instructions were phrased as if written to a human reading the email rather than to the AI, the classifier treated them as harmless [[4]](#src-4).
2. **Link redaction was bypassed.** Copilot stripped external links from answers, but only inline Markdown links of the form `[text](url)`. Reference-style links (`[text][ref]` with `[ref]: url` below) passed through [[4]](#src-4).
3. **An image loaded by itself.** When the answer contained a reference-style image, the browser fetched it without any click. Data embedded in the image URL went out with that request [[4]](#src-4).
4. **The Content Security Policy (CSP) was bypassed.** The browser only loaded images from allowed Microsoft domains. But one allowed endpoint, a Teams link-preview service, fetched any URL passed to it server-side. The request therefore reached the attacker's server through a "trusted" Microsoft address [[4]](#src-4).

Microsoft classified the flaw as CWE-74 (improper neutralisation of output used by a downstream component) [[2]](#src-2).

**Mapping**

| Framework | Item | In this incident |
|---|---|---|
| OWASP | LLM01 Prompt Injection | Indirect injection: the instruction comes from an email the model reads, not from the user |
| OWASP | LLM02 Sensitive Information Disclosure | Data the user is entitled to reaches an unauthorised third party |
| OWASP | LLM05 Improper Output Handling | Model-generated Markdown is rendered without validation, triggering an image request |
| ATLAS | AML.T0051.001 | Indirect prompt injection via email |
| ATLAS | AML.T0068 | Instructions worded to evade the classifier |
| ATLAS | AML.T0057 | Leakage from data sources the model is connected to |
| ATLAS | AML.T0077 | Data exfiltrated while the response is rendered (image load) |

## Attacker's view

From the attacker's side EchoLeak is an elegant chain, because each step abuses a gap that looks "small" on its own:

1. **Write the email.** It reads like an ordinary work note to an employee. The instructions are embedded as sentences addressed to a person.
2. **Get it retrieved.** Copilot does not read the whole mailbox for every question; it pulls in content it judges relevant. So the email is written to resemble topics employees ask about often (leave, HR, projects) to raise its chance of entering the context.
3. **Wait.** When the victim eventually asks Copilot a related question, the email enters the context. The attacker does nothing at that moment.
4. **Package the data.** The instruction asks the model to take the most sensitive information in context and put it in an image URL parameter.
5. **Open the channel.** A reference-style image plus a redirect through an allowed Microsoft endpoint makes the browser send the request by itself. The data lands in the attacker's server logs.

What an attacker would try next: the same chain through other inputs (a shared document, a Teams message, a calendar invite); the next Markdown syntax the filters forgot; another allowed service that takes a URL and fetches it server-side. When an output filter is a blocklist, the attacker's job is to find the syntax that is not on the list.

## How it could have been fixed

### a) Defender side: Microsoft 365 and the organisation using it

- **Handle output with an allowlist.** A blocklist (stripping only inline links) always misses a syntax. Every link or image in an answer that points to an external address should be removed or require user approval, regardless of how it is written [[4]](#src-4).
- **Audit the CSP allowlist.** If an allowed domain hosts a service that makes requests to other addresses (previews, proxies, redirects), the allowlist effectively allows everything.
- **Keep external content separate.** Email from outside the organisation should not share a context with internal data. If it must, it should be explicitly marked as an untrusted source [[4]](#src-4).
- **Narrow the scope on the organisation's side.** Copilot can read whatever the user can, so over-shared SharePoint sites and "everyone" folders are a direct risk. Sensitive documents should be labelled and excluded from what the AI assistant can process.

### b) AI side: agent guardrails, permissions, monitoring

- **Separate instructions from data.** Every piece entering the context should carry a source label (user, internal document, external email), and text from external sources should never be treated as instructions. This is not enough on its own, but it stops the classifier from being the only line of defence [[4]](#src-4).
- **Do not rely on a classifier alone.** The XPIA classifier missed instructions written as if to a human. Input classification, output checks and network restrictions should work together as separate layers.
- **Block scope violations directly.** If an answer draws on both an untrusted source and a sensitive internal document and contains an external address, it should be blocked or held for approval.
- **Monitor.** External URLs, long encoded parameters and image references in answers should be logged and raise alerts. In EchoLeak the user saw nothing; detection was only possible from output and network logs.

## What I learned

- Prompt injection is a trigger, not the outcome. The size of the damage is decided by small gaps in output handling and the network layer behind it.
- Every blocklist filter hands the attacker a task: find what is not on the list. In EchoLeak that was a single Markdown syntax.
- A "trusted domain" stops meaning anything once it hosts a service that fetches other URLs.
- I want to rebuild this chain in my own agent test bed, with a fake inbox and a local server that catches the image request, and measure whether local models follow instructions hidden in external email.
