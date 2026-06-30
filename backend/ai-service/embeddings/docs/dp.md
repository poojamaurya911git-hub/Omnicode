# Dynamic Programming — Competitive Programming Knowledge Base

## Core Philosophy

Dynamic programming (DP) solves problems by breaking them into overlapping subproblems and storing results to avoid redundant computation. The two approaches are top-down (memoization) and bottom-up (tabulation).

## Memoization (Top-Down)

Start from the original problem and recurse into subproblems, caching results.

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

## Tabulation (Bottom-Up)

Build solutions iteratively from smallest subproblems upward.

```cpp
int fib(int n) {
    if (n <= 1) return n;
    vector<int> dp(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}
```

## 0/1 Knapsack

Given n items with weights and values, maximize value within weight capacity W.

```python
def knapsack(W, weights, values, n):
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i-1][w]  # Don't take item i
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])
    return dp[n][W]
```

Space-optimized to O(W):
```python
def knapsack_optimized(W, weights, values, n):
    dp = [0] * (W + 1)
    for i in range(n):
        for w in range(W, weights[i] - 1, -1):  # Reverse to avoid reuse
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]
```

## Longest Common Subsequence (LCS)

```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
```

## Longest Increasing Subsequence (LIS)

O(n log n) solution using patience sorting with binary search:

```python
from bisect import bisect_left

def lis(arr):
    tails = []
    for x in arr:
        pos = bisect_left(tails, x)
        if pos == len(tails):
            tails.append(x)
        else:
            tails[pos] = x
    return len(tails)
```

## Common DP Patterns

1. **Linear DP** — dp[i] depends on previous states (climbing stairs, house robber)
2. **Interval DP** — dp[i][j] for subarray [i..j] (matrix chain, burst balloons)
3. **Knapsack variants** — subset sum, coin change, partition equal subset
4. **Grid DP** — dp[i][j] for paths in 2D grid (unique paths, minimum path sum)
5. **String DP** — edit distance, LCS, palindrome partitioning
6. **Bitmask DP** — dp[mask] for subset enumeration (TSP, assignment problem)
7. **Digit DP** — count numbers with properties in range [L, R]
8. **Tree DP** — dp on tree nodes (maximum independent set, tree diameter)

## State Optimization

- **Rolling array**: Reduce 2D DP to 1D when dp[i] only depends on dp[i-1]
- **State compression**: Use bitmask to represent subsets of items
- **Convex hull trick**: Optimize transitions of form dp[i] = min(dp[j] + cost(j, i))
