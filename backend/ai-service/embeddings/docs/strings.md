# Strings — Competitive Programming Knowledge Base

## KMP (Knuth-Morris-Pratt) Algorithm

Pattern matching in O(n + m) time. The key is the failure function (partial match table).

```python
def kmp_search(text, pattern):
    n, m = len(text), len(pattern)
    # Build failure function
    lps = [0] * m
    length = 0
    i = 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        elif length:
            length = lps[length - 1]
        else:
            lps[i] = 0
            i += 1

    # Search
    matches = []
    i = j = 0
    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and text[i] != pattern[j]:
            if j:
                j = lps[j - 1]
            else:
                i += 1
    return matches
```

## Z-Algorithm

Computes Z-array where Z[i] is the length of longest substring starting at i that matches a prefix of the string. O(n) time.

```python
def z_function(s):
    n = len(s)
    z = [0] * n
    z[0] = n
    l, r = 0, 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z

def z_search(text, pattern):
    """Pattern matching using Z-algorithm."""
    combined = pattern + "$" + text
    z = z_function(combined)
    m = len(pattern)
    return [i - m - 1 for i in range(m + 1, len(combined)) if z[i] == m]
```

## Rabin-Karp Algorithm

Rolling hash for pattern matching. Average O(n + m), worst O(nm). Useful for multiple pattern matching.

```python
def rabin_karp(text, pattern, base=31, mod=10**9 + 7):
    n, m = len(text), len(pattern)
    if m > n:
        return []

    # Compute hash of pattern and first window
    p_hash = 0
    t_hash = 0
    power = 1
    for i in range(m):
        p_hash = (p_hash + ord(pattern[i]) * power) % mod
        t_hash = (t_hash + ord(text[i]) * power) % mod
        if i < m - 1:
            power = (power * base) % mod

    matches = []
    for i in range(n - m + 1):
        if p_hash == t_hash and text[i:i+m] == pattern:
            matches.append(i)
        if i < n - m:
            t_hash = (t_hash - ord(text[i])) % mod
            t_hash = (t_hash * pow(base, mod - 2, mod)) % mod
            t_hash = (t_hash + ord(text[i + m]) * power) % mod
    return matches
```

## Trie (Prefix Tree)

Efficient prefix matching, autocomplete, and word dictionary operations.

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False
        self.count = 0

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
            node.count += 1
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return 0
            node = node.children[ch]
        return node.count
```

## Suffix Array

Sorted array of all suffixes. Useful for substring search, LCP computations.

```python
def build_suffix_array(s):
    """O(n log²n) suffix array construction."""
    n = len(s)
    suffixes = list(range(n))
    rank = [ord(c) for c in s]
    tmp = [0] * n
    k = 1
    while k < n:
        def compare(a, b):
            if rank[a] != rank[b]:
                return rank[a] - rank[b]
            ra = rank[a + k] if a + k < n else -1
            rb = rank[b + k] if b + k < n else -1
            return ra - rb
        from functools import cmp_to_key
        suffixes.sort(key=cmp_to_key(compare))
        tmp[suffixes[0]] = 0
        for i in range(1, n):
            tmp[suffixes[i]] = tmp[suffixes[i-1]]
            if compare(suffixes[i], suffixes[i-1]) > 0:
                tmp[suffixes[i]] += 1
        rank = tmp[:]
        k *= 2
    return suffixes
```

## Key String Patterns

1. **KMP/Z-algorithm** for exact pattern matching in O(n + m)
2. **Rabin-Karp** for multi-pattern matching with rolling hashes
3. **Trie** for prefix queries, autocomplete, XOR problems
4. **Suffix array + LCP** for substring search and repeated patterns
5. **Manacher's algorithm** for longest palindromic substring in O(n)
6. **String hashing** for fast substring comparison
