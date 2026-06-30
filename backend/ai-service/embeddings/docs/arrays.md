# Arrays — Competitive Programming Knowledge Base

## Core Concepts

Arrays are the most fundamental data structure in competitive programming. Mastery of array manipulation techniques is essential for solving problems efficiently.

## Prefix Sum

The prefix sum technique precomputes cumulative sums to answer range sum queries in O(1) time after O(n) preprocessing.

```python
# Build prefix sum array
def build_prefix(arr):
    n = len(arr)
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + arr[i]
    return prefix

# Range sum query [l, r] inclusive
def range_sum(prefix, l, r):
    return prefix[r + 1] - prefix[l]
```

```cpp
// C++ prefix sum
vector<long long> prefix(n + 1, 0);
for (int i = 0; i < n; i++)
    prefix[i + 1] = prefix[i] + arr[i];
// Sum of arr[l..r] = prefix[r+1] - prefix[l]
```

## Two Pointers Technique

Two pointers is used on sorted arrays or when searching for pairs/subarrays that satisfy a condition. The technique reduces O(n²) brute force to O(n).

**Classic applications:**
- Finding pairs with a given sum in sorted array
- Removing duplicates from sorted array
- Container with most water
- Trapping rain water

```python
# Two Sum on sorted array
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]
        if current == target:
            return [left, right]
        elif current < target:
            left += 1
        else:
            right -= 1
    return [-1, -1]
```

## Kadane's Algorithm

Kadane's algorithm finds the maximum subarray sum in O(n) time. It's one of the most frequently tested algorithms.

```python
def max_subarray_sum(arr):
    max_sum = arr[0]
    current_sum = arr[0]
    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    return max_sum
```

```cpp
int kadane(vector<int>& arr) {
    int maxSum = arr[0], curSum = arr[0];
    for (int i = 1; i < arr.size(); i++) {
        curSum = max(arr[i], curSum + arr[i]);
        maxSum = max(maxSum, curSum);
    }
    return maxSum;
}
```

## Dutch National Flag (3-way Partition)

Partition array into three sections in single pass — used in problems like Sort Colors.

```python
def sort_colors(arr):
    low, mid, high = 0, 0, len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1; mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
```

## Key Patterns

1. **Sliding window** — fixed or variable size window over array
2. **Prefix/suffix arrays** — precompute cumulative data
3. **Sorting + two pointers** — reduce search space
4. **Monotonic stack** — next greater/smaller element
5. **In-place manipulation** — modify array without extra space
6. **Circular arrays** — use modulo arithmetic for wrap-around
