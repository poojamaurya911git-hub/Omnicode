# Sliding Window — Competitive Programming Knowledge Base

## Core Concept

The sliding window technique maintains a window (subarray/substring) over data, sliding it efficiently to avoid recomputation. Reduces O(n²) or O(n×k) brute force to O(n).

Two main types:
1. **Fixed-size window** — window size is constant
2. **Variable-size window** — window expands/shrinks based on a condition

## Fixed-Size Sliding Window

Window size k is predetermined. Slide the window one element at a time.

```python
def max_sum_subarray(arr, k):
    """Maximum sum of subarray of size k."""
    n = len(arr)
    if n < k:
        return -1

    # Compute sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum

    # Slide: add right element, remove left element
    for i in range(k, n):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum
```

```cpp
int maxSumSubarray(vector<int>& arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++)
        windowSum += arr[i];
    int maxSum = windowSum;
    for (int i = k; i < arr.size(); i++) {
        windowSum += arr[i] - arr[i - k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}
```

**Fixed window applications:**
- Maximum/minimum sum of subarray of size k
- Maximum of all subarrays of size k (using deque)
- String permutation check (anagram in string)
- Moving average computation

## Maximum of All Subarrays of Size K

Using monotonic deque for O(n) total time:

```python
from collections import deque

def max_sliding_window(nums, k):
    dq = deque()  # Store indices, front is always max
    result = []

    for i in range(len(nums)):
        # Remove indices outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        # Remove smaller elements from back
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
        dq.append(i)
        # Window is complete
        if i >= k - 1:
            result.append(nums[dq[0]])

    return result
```

## Variable-Size Sliding Window

Window expands by moving right pointer and shrinks by moving left pointer.

**Template:**
```python
def variable_window(arr, condition):
    left = 0
    result = 0
    window_state = ...  # Track window properties

    for right in range(len(arr)):
        # Expand: add arr[right] to window
        update_state(window_state, arr[right])

        # Shrink: while window violates condition
        while not condition(window_state):
            remove_state(window_state, arr[left])
            left += 1

        # Update result
        result = max(result, right - left + 1)

    return result
```

## Longest Substring Without Repeating Characters

Classic variable window problem:

```python
def length_of_longest_substring(s):
    char_index = {}
    left = 0
    max_len = 0

    for right in range(len(s)):
        if s[right] in char_index and char_index[s[right]] >= left:
            left = char_index[s[right]] + 1
        char_index[s[right]] = right
        max_len = max(max_len, right - left + 1)

    return max_len
```

## Minimum Window Substring

Find smallest substring of s containing all characters of t:

```python
from collections import Counter

def min_window(s, t):
    if not t or not s:
        return ""

    target = Counter(t)
    required = len(target)
    formed = 0
    window = {}
    left = 0
    min_len = float('inf')
    result = ""

    for right in range(len(s)):
        ch = s[right]
        window[ch] = window.get(ch, 0) + 1

        if ch in target and window[ch] == target[ch]:
            formed += 1

        while formed == required:
            if right - left + 1 < min_len:
                min_len = right - left + 1
                result = s[left:right + 1]

            left_ch = s[left]
            window[left_ch] -= 1
            if left_ch in target and window[left_ch] < target[left_ch]:
                formed -= 1
            left += 1

    return result
```

## Two Pointer Technique

Closely related to sliding window. Two pointers move in the same or opposite directions.

```python
def two_sum_sorted(arr, target):
    """Find pair summing to target in sorted array."""
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return [left, right]
        elif total < target:
            left += 1
        else:
            right -= 1
    return []

def remove_duplicates(arr):
    """Remove duplicates in-place from sorted array."""
    if not arr:
        return 0
    write = 1
    for read in range(1, len(arr)):
        if arr[read] != arr[read - 1]:
            arr[write] = arr[read]
            write += 1
    return write
```

## Subarray Sum Equals K (with HashMap)

When elements can be negative, use prefix sum + hashmap:

```python
def subarray_sum(nums, k):
    count = 0
    prefix = 0
    seen = {0: 1}
    for num in nums:
        prefix += num
        if prefix - k in seen:
            count += seen[prefix - k]
        seen[prefix] = seen.get(prefix, 0) + 1
    return count
```

## Key Sliding Window Patterns

1. **Fixed window** — sum/max/min/count over exactly k elements
2. **Variable window (longest)** — expand right, shrink left when condition violated
3. **Variable window (shortest)** — expand right, shrink left when condition satisfied
4. **Two pointers (opposite)** — sorted array pair search
5. **Two pointers (same direction)** — fast/slow pointer, merging
6. **Deque window** — monotonic deque for sliding max/min
