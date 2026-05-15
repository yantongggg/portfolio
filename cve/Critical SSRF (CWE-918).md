https://github.com/oscal-compass/compliance-trestle/security/advisories/GHSA-w76h-q7c6-jpjp

Skip to content
oscal-compass
compliance-trestle
Repository navigation
Code
Issues
43
 (43)
Pull requests
29
 (29)
Agents
Discussions
Actions
Projects
Security and quality
Insights

Critical SSRF (CWE-918)
 Draft	Moderate	yantongggg opened GHSA-w76h-q7c6-jpjp on Mar 30 · 25 comments
Package
 compliance-trestle (
pip
)
Affected versions
< 3.3.0
Patched versions
None
yantongggg opened on Mar 30 • 
Description
I have identified three significant security vulnerabilities in the trestle/core/remote/cache.py module during a source code audit.

Finding 1 (Critical): SSRF (CWE-918)
The HTTPSFetcher._do_fetch() method passes a user-supplied URL directly to requests.get() without validation. This allows an attacker to perform Server-Side Request Forgery, targeting internal services or cloud metadata endpoints (e.g., 169.254.169.254).

Per rule 4.2.11 of the CVE CNA rules Finding 1 will be addressed in this advisory, while findings 2 & 3 will be addressed in separate advisories:

Multiple Path Traversal Vulnerabilities in Remote Fetching Subsystem

Finding 2 & 3 (High/Medium): Path Traversal (CWE-22)
The caching logic for HTTPSFetcher and LocalFetcher fails to sanitize URI paths, allowing for arbitrary file reads via file:// or writing cached files outside the intended directory.

Impact: > These vulnerabilities can be chained to exfiltrate sensitive cloud credentials or compromise CI/CD environments.

Reproduction: > Please see the attached poc_ssrf_and_path_traversal.py and terminal_output.txt. 13 exploit vectors have been verified locally.

compliance-trestle_audit_2026-03-30.pdf
poc_ssrf_and_path_traversal.py
terminal_output.txt

@yantongggg yantongggg added themselves as a collaborator on Mar 30
@yantongggg yantongggg was credited as a reporter on Mar 30
@yantongggg yantongggg accepted credit on Mar 30
@degenaro
Collaborator
degenaro
commented
on Mar 30
@yantongggg 3.3.0 is quite old. The current version is 4.0.1 (and temporarily 3.12.0).

@degenaro
Collaborator
degenaro
commented
on Mar 31
@yantongggg Thanks for this report. The issue exists in the current release as well. Investigation on how to remedy is underway.

@degenaro degenaro created the temporary private fork oscal-compass/compliance-trestle-ghsa-w76h-q7c6-jpjp on Mar 31
@degenaro
Collaborator
degenaro
commented
on Mar 31
@yantongggg There is a PR for your review. Please have a look and approve if you agree or suggest what is lacking if not. Thx!

@degenaro
Collaborator
degenaro
commented
on Apr 1
FINDING 1 — SSRF (CWE-918): ✅ FIXED
Implementation in trestle/core/remote/cache.py (lines 232-235):

HTTPSFetcher now validates URLs using URLSecurityValidator before making requests
Blocks cloud metadata endpoints (AWS, GCP, Azure)
Blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x)
Blocks IPv6 loopback and link-local addresses
Only allows HTTPS scheme
Security module trestle/core/remote/security.py:

URLSecurityValidator class performs comprehensive URL validation
DNS resolution and IP checking before requests
Configurable allowlist for domains
Tests in tests/trestle/core/remote/cache_security_test.py:

Tests for all 6 SSRF vectors from the PoC
Validates blocking of AWS metadata, GCP metadata, localhost, private networks, IPv6 loopback

FINDING 2 — Path Traversal in Cache (CWE-22): ✅ FIXED
Implementation in trestle/core/remote/cache.py:

HTTPSFetcher (lines 283-303): Sanitizes URL paths and validates cache paths
SFTPFetcher (lines 367-386): Same protections applied
Uses sanitize_url_path_for_cache() to remove traversal sequences
Uses PathSecurityValidator.validate_cache_path() to ensure paths stay within cache
Security module trestle/core/remote/security.py:

sanitize_url_path_for_cache() function replaces .. with __
PathSecurityValidator.validate_cache_path() uses resolve() and relative_to() checks
Tests:

Validates path traversal attempts are blocked
Confirms cache paths remain within .trestle/cache directory

FINDING 3 — Arbitrary File Read via file:// (CWE-22): ✅ FIXED
Implementation in trestle/core/remote/cache.py (lines 207-209):

LocalFetcher validates file:// URIs to restrict access to workspace
Uses PathSecurityValidator.validate_local_file_path() with allow_outside_workspace=False
Also validates trestle:// URIs (lines 182-184)
Security module trestle/core/remote/security.py:

PathSecurityValidator.validate_local_file_path() ensures files are within workspace
Logs warnings for sensitive system files
Tests:

Validates blocking of /etc/passwd, /etc/hosts, and other system files
Confirms path traversal in file:// URIs is blocked
Validates trestle:// URIs stay within workspace

@yantongggg
Author
yantongggg
commented
on Apr 1
Hi, thanks for the thorough fix — all 3 findings are addressed and the test coverage looks comprehensive. A couple of observations before I approve:

DNS Rebinding TOCTOU in URLSecurityValidator
The validate_url() method resolves the hostname via socket.getaddrinfo() during HTTPSFetcher.init(), but the actual HTTP request in _do_fetch() calls requests.get(self._url) which performs its own independent DNS resolution. This opens a time-of-check-time-of-use window:

1st DNS query (validation at init): attacker.com → 8.8.8.8 (public, passes check)
2nd DNS query (requests.get in _do_fetch): attacker.com → 169.254.169.254 (SSRF succeeds)
An attacker with a short-TTL DNS record can alternate between safe and unsafe IPs. Suggested mitigation: pin the resolved IP from validation and pass it to requests.get() directly (e.g., via a custom transport adapter or by replacing the hostname with the validated IP and setting the Host header).

SFTPFetcher missing hostname/IP validation
URLSecurityValidator is only applied to HTTPSFetcher. The SFTPFetcher received path sanitization and cache validation (good), but no private IP / metadata endpoint blocking on the hostname. This means:

trestle import -f sftp://10.0.0.1/internal/data.json -o stolen
trestle import -f sftp://192.168.1.1/sensitive/file.json -o stolen
...would still connect to internal network hosts via SSH. Suggest applying equivalent hostname/IP validation to SFTPFetcher.init() as well.

Everything else looks solid. Happy to approve once #1 and #2 are addressed.

@degenaro
Collaborator
degenaro
commented
on Apr 1
@yantongggg Both concerns are now fully addressed:

✅ DNS Rebinding: Mitigated by re-validating URL immediately before each fetch, catching DNS changes before requests happen
✅ SFTP Validation: Fully implemented with same protections as HTTPS, comprehensive test coverage

@degenaro
Collaborator
degenaro
commented
on Apr 2
@yantongggg Would appreciate a review of PR. Would like to close on this ASAP. Thx!

@butler54 Same.

@butler54
Collaborator
butler54
commented
on Apr 2
@yantongggg / @degenaro will look through this in detail. First past everything makes sense.

I'll need to dig into the DNS validation - how we do this without carrying piles of code it my only concern,.

There is one challenge we really have which is on the private IP blocking. While I agree the metadata URLs for cloud providers (and potentially link local as well) could be blocked by default.

e.g. if I test trestle against our private gitlab server - which is an intended usecase - it would be a behavioural change on the end users.

TL;DR: Do we need to do this as a major change and put lots of warnings up separately.

@degenaro: The bigger piece of work is actually going to be properly setting up the multi-release branching. My assumption is that we need to do this for at least 3 & 4 release trains.

@butler54
Collaborator
butler54
commented
on Apr 2
Also can you explain why the attack vector is network? the CVSS definition is:
"The vulnerable system is bound to the network stack and the set of possible attackers extends beyond the other options listed below, up to and including the entire Internet. Such a vulnerability is often termed “remotely exploitable” and can be thought of as an attack being exploitable at the protocol level one or more network hops away (e.g., across one or more routers). An example of a network attack is an attacker causing a denial of service (DoS) by sending a specially crafted TCP packet across a wide area network (e.g., CVE-2004-0230)."

The attack vectors that you presented requires CLI access to trestle? this implies the attack vector is local.

@yantongggg
Author
yantongggg
commented
on Apr 2
• 
@butler54
Hmmm So the CLI path (trestle import -f) is definitely local — no argument there. But there's a second path that bumps it to Network, and it's the one I'd focus the advisory on.

Trestle auto-resolves href fields inside OSCAL documents. When a profile has imports[*].href pointing at a remote URL, running something like trestle author ssp-generate or even just validating the profile triggers _import.py → FetcherFactory.get_fetcher() → HTTPSFetcher → requests.get(). No one types the malicious URL on the command line — it's embedded in the OSCAL JSON itself.

The scenario I had in mind: attacker opens a PR against a compliance content repo (or poisons an upstream catalog reference). The PR swaps an href to https://169.254.169.254/latest/meta-data/.... CI picks it up, trestle resolves the href, SSRF fires on the pipeline runner. Attacker never had shell access. Your own README says trestle is "designed to operate as a CICD pipeline running on top of compliance artifacts in git" — that's exactly the context where this becomes AV:N.

That said, if you want to score it conservatively against just the trestle import -f CLI path, AV:L with UI:R is reasonable. I won't fight over the CVSS number — the fix is the same either way. Up to you which vector you want in the advisory.

@yantongggg
Author
yantongggg
commented
on Apr 2
@butler54

Yeah, blanket-blocking all RFC 1918 ranges would definitely break things — I didn't think about the private GitLab use case but that makes total sense.

What I'd suggest is splitting it into two tiers:

Always block (zero legitimate use for OSCAL fetching):

Cloud metadata: 169.254.169.254, metadata.google.internal, Azure wireserver
Link-local: 169.254.0.0/16, fe80::/10
Loopback: 127.0.0.0/8, ::1
Private ranges — allow by default, optionally block:

10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
Ship them as allowed (no breakage for existing users), but log a warning
Add a config knob — env var like TRESTLE_ALLOWED_HOSTS or a setting in .trestle/config.ini — so stricter deployments can lock it down
That way nobody's private GitLab setup breaks on upgrade, and it can ship as a patch on both 3.x and 4.x without needing a major version bump. The metadata/loopback block alone closes the highest-impact SSRF vector.

@degenaro
Collaborator
degenaro
commented
on Apr 6
@butler54 Where do we stand on this? Should I attempt to implement @yantongggg suggestions? Do you want to take over the coding?

@butler54
Collaborator
butler54
commented
last month
Just FYI we are working through some of the pre-work now #2201

which is required

@butler54
Collaborator
butler54
commented
last month
just going back to @yantongggg last comment - that was what I was thinking of as well. @degenaro do you think you can modify the fix?

@degenaro
Collaborator
degenaro
commented
3 weeks ago
@butler54 @yantongggg two tiers approach delivered.

@degenaro
Collaborator
degenaro
commented
2 weeks ago
Comments? @butler54 @yantongggg two tiers approach delivered. Would like to include this in our next release, mid-May or sooner, then finish off the security issue process. Thx!

@yantongggg
Author
yantongggg
commented
2 weeks ago
Looks good to me. I’m okay with closing this once released. Could you also request a CVE for the advisory before publishing?

@degenaro degenaro accepted this report 2 weeks ago
@degenaro degenaro requested a CVE 2 weeks ago
@butler54 butler54 requested a CVE 2 weeks ago
@butler54
Collaborator
butler54
commented
2 weeks ago
@yantongggg will let you know when it comes up.

@degenaro degenaro added @AnistoMejin AnistoMejin as a collaborator last week
@degenaro
Collaborator
degenaro
commented
last week
@AnistoMejin This security advisory is similar to the two that you submitted. The claim is that the solution here will cover your issues as well. Please review to see if you agree. We will give both @yantongggg and @AnistoMejin credit.

@AnistoMejin
AnistoMejin
commented
last week
I reviewed the fixes and agree the remediation appears to cover the issues I reported as well thanks for including me in the advisory and credit process.

@github-staff github-staff could not assign a CVE last week
@github-staff
github-staff
commented
last week
GitHub cannot issue a CVE for this Security Advisory because this advisory includes information about more than one vulnerability.

According to rule 4.2.11 of the CVE CNA rules:

4.2.6 CNAs SHOULD assign different CVE IDs to separate Vulnerabilities, as determined using the guidance in 4.1.

4.2.11 CNAs SHOULD assign different CVE IDs to different, Independently Fixable Vulnerabilities.

You can move forward in one of two ways:

If you agree that this Security Advisory concerns more than one independently fixable vulnerability, split each vulnerability into its own advisory and request one CVE for each vulnerability.
If you do not agree that these vulnerabilities are independently fixable, resubmit the CVE request with a section clarifying how they are dependent and should have the same CVE.
Thank you for making the open source ecosystem more secure by fixing and responsibly disclosing these vulnerabilities.

@AnistoMejin
AnistoMejin
commented
last week
Understood — the findings are independently fixable, so splitting them into separate advisories/CVEs makes sense to me. Thanks for the clarification and coordination on this.

@degenaro
Collaborator
degenaro
commented
4 days ago
@github-staff Thank you for the review and clarification regarding CVE CNA rule 4.2.11.

There exist 3 advisories from @yantongggg and @AnistoMejin, each pertaining to all or
different parts of 3 separable vulnerability issues.

3 separable vulnerability issues
Issue 1: Arbitrary File Write via Cache Path Traversal (CWE-22)
Component: HTTPSFetcher and SFTPFetcher cache path construction
Root Cause: URL paths with ../ sequences are not sanitized before constructing
cache file paths, allowing writes outside the cache directory
Attack: https://evil.com/../../../tmp/pwned.json → writes to /tmp/pwned.json
Impact: Arbitrary file write → RCE via cron jobs, SSH keys, config files
Fix: Sanitize URL paths + validate cache paths stay within cache directory
Independently Fixable: Yes - affects only cache path construction logic
Issue 2: Arbitrary File Read via LocalFetcher Path Traversal (CWE-22)
Component: LocalFetcher trestle:// and file:// URI resolution
Root Cause: URI paths with ../ sequences are resolved without boundary checks,
allowing reads outside the workspace
Attack: trestle://../../etc/passwd → reads /etc/passwd
Impact: Arbitrary file read → credential theft, system reconnaissance
Fix: Validate local file paths stay within workspace directory
Independently Fixable: Yes - affects only LocalFetcher URI resolution logic
Issue 3: Server-Side Request Forgery (SSRF) (CWE-918)
Component: HTTPSFetcher URL validation
Root Cause: User-supplied URLs are passed directly to requests.get() without
validation of the destination
Attack: https://169.254.169.254/latest/meta-data/ → accesses AWS metadata endpoint
Impact: Cloud credential theft, internal network scanning, firewall bypass
Fix: Validate URLs before requests, block metadata endpoints and private IPs
Independently Fixable: Yes - affects only HTTPSFetcher URL handling logic
Plan of action
To comply with CVE CNA rules, each vulnerability will be handled through a separate advisory.
We will adjust the present advisory (Advisory 3) title and description to address SSRF (Issue 3) only.

Advisory 1: GHSA-g3vg-vx23-3858 → Issue 1 (File Write)
Scope: Arbitrary file write via cache path traversal
Components: HTTPSFetcher cache, SFTPFetcher cache
CWE: CWE-22 (Path Traversal)
Fix: Cache path sanitization + boundary validation
CVE: Will request CVE for this advisory
Advisory 2: GHSA-mj4x-vf5c-5xg8 → Issue 2 (File Read)
Scope: Arbitrary file read via LocalFetcher path traversal
Components: LocalFetcher trestle:// and file:// URIs
CWE: CWE-22 (Path Traversal)
Fix: Local file path validation + workspace confinement
CVE: Will request CVE for this advisory
Advisory 3: GHSA-w76h-q7c6-jpjp (this advisory) → Issue 3 (SSRF)
Scope: Server-Side Request Forgery in HTTPSFetcher
Components: HTTPSFetcher URL handling
CWE: CWE-918 (SSRF)
Fix: URL validation + IP allowlist/blocklist
CVE: Will resubmit CVE request for this advisory after updating description
@yantongggg and @AnistoMejin will be credited on all three advisories.

@degenaro degenaro changed the title Critical SSRF (CWE-918) and Multiple Path Traversal Vulnerabilities in Remote Fetching Subsystem Critical SSRF (CWE-918) 2 days ago
@AnistoMejin AnistoMejin was credited as a reporter 2 days ago
@degenaro
Collaborator
degenaro
commented
2 days ago
GitHub cannot issue a CVE for this Security Advisory because this advisory includes information about more than one vulnerability.

According to rule 4.2.11 of the CVE CNA rules:

4.2.6 CNAs SHOULD assign different CVE IDs to separate Vulnerabilities, as determined using the guidance in 4.1.

4.2.11 CNAs SHOULD assign different CVE IDs to different, Independently Fixable Vulnerabilities.

You can move forward in one of two ways:

If you agree that this Security Advisory concerns more than one independently fixable vulnerability, split each vulnerability into its own advisory and request one CVE for each vulnerability.
If you do not agree that these vulnerabilities are independently fixable, resubmit the CVE request with a section clarifying how they are dependent and should have the same CVE.
Thank you for making the open source ecosystem more secure by fixing and responsibly disclosing these vulnerabilities.

Re-requesting CVE with changes to this advisory per rule 4.2.11 of the CVE CNA rules. See revised title and Description.

@degenaro degenaro requested a CVE 2 days ago
@l3tchupkt l3tchupkt was credited as a reporter 2 days ago
@degenaro degenaro added @l3tchupkt l3tchupkt as a collaborator 2 days ago
@l3tchupkt l3tchupkt accepted credit 2 days ago
@github-staff github-staff assigned CVE-2026-46380 yesterday
@github-staff
github-staff
commented
yesterday
GitHub has issued CVE-2026-46380 for this Security Advisory after reviewing it for compliance with CVE rules. Once your Security Advisory is published, we'll publish the CVE record to the CVE List. At that time, if your package is in a supported ecosystem, we'll also publish an advisory in the global GitHub Advisory Database and send security alerts to affected repositories.

Thank you for making the open source ecosystem more secure by fixing and responsibly disclosing this vulnerability.

Collaborate on a patch
https://github.com/oscal-compass/compliance-trestle-ghsa-w76h-q7c6-jpjp.git
Use the temporary private fork to collaborate on a patch for this advisory.

fix: URI fetch issues
#2 opened 3 weeks ago by degenaro • Approved
 2
oscal-compass/compliance-trestle:develop ← oscal-compass/compliance-trestle-ghsa-w76h-q7c6-jpjp:develop
This advisory may be blocked by repository rules
4 repository rules found
Show rules
 These changes may only be merged by someone with publishing rights.
Required advisory information has been provided
You’re ready to publish, but first you must merge or close outstanding pull requests.
Suggested advisory information
Provide additional information to help your users prioritize and remediate this advisory appropriately.
Patched version
 
— Notify your users of safe update options.
@yantongggg
Write
Preview
Leave a comment
Severity
Moderate
/ 10
CVSS v3 base metrics
Attack vector
Local
Attack complexity
Low
Privileges required
Low
User interaction
Required
Scope
Changed
Confidentiality
High
Integrity
Low
Availability
None
CVSS:3.1/AV:L/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:N
CVE ID
CVE-2026-46380
Weaknesses
No CWEs
Credits
@yantongggg yantongggg
Reporter Accepted about 2 months ago
@l3tchupkt l3tchupkt
Reporter Accepted 1 day ago
@AnistoMejin AnistoMejin
Reporter Pending for 1 day
Collaborators
Only the following users and teams can see and collaborate on this advisory:

@oscal-compass oscal-compass owners
@degenaro degenaro
@butler54 butler54
@vikas-agarwal76 vikas-agarwal76
@AnistoMejin AnistoMejin
@yantongggg yantongggg Author
@l3tchupkt l3tchupkt
Publishers
Only the following users and teams can publish this advisory:

@oscal-compass oscal-compass owners
@degenaro degenaro
@butler54 butler54
@vikas-agarwal76 vikas-agarwal76
Footer
© 2026 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
Community
Docs
Contact
Manage cookies
Do not share my personal information
