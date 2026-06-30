# Binary Search — Competitive Programming Knowledge Base

## Core Concept

Binary search reduces a sorted search space by half at each step, achieving O(log n) time. It applies not just to sorted arrays but to any monotonic predicate function.

## Standard Binary Search

```python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2  # Avoid overflow
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

```cpp
int binary_search(vector<int>& arr, int target) {
    int lo = 0, hi = arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

## Lower Bound and Upper Bound

Lower bound: first position where arr[i] >= target
Upper bound: first position where arr[i] > target

```python
def lower_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

def upper_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= target:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

## Binary Search on Answer

Instead of searching in an array, search the answer space. The key insight is that the predicate is monotonic.

**Template:**
```python
def search_on_answer(lo, hi, predicate):
    """Find minimum x in [lo, hi] such that predicate(x) is True."""
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
```

**Example: Minimum capacity to ship packages in D days**
```python
def ship_within_days(weights, days):
    def can_ship(capacity):
        trips = 1
        current = 0
        for w in weights:
            if current + w > capacity:
                trips += 1
                current = 0
            current += w
        return trips <= days

    lo = max(weights)
    hi = sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
```

## Search in Rotated Sorted Array

Find element in a sorted array that has been rotated at an unknown pivot.

```python
def search_rotated(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid

        # Left half is sorted
        if arr[lo] <= arr[mid]:
            if arr[lo] <= target < arr[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        # Right half is sorted
        else:
            if arr[mid] < target <= arr[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

## Find Peak Element

Find a local maximum in O(log n).

```python
def find_peak(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < arr[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

## Binary Search on Real Numbers

For problems requiring precision (e.g., minimize maximum distance).

```python
def binary_search_real(lo, hi, predicate, eps=1e-9):
    """Search real-valued answer space."""
    for _ in range(100):  # ~100 iterations for 1e-30 precision
        mid = (lo + hi) / 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid
    return lo
```

## Common Binary Search Patterns

1. **Classic search** — find element in sorted array
2. **Lower/upper bound** — find insertion point
3. **Search on answer** — minimize/maximize a monotonic objective
4. **Rotated array** — identify which half is sorted
5. **2D search** — search in row-sorted and column-sorted matrix
6. **Binary search + greedy** — check feasibility with binary search
7. **Fractional binary search** — search over real numbers for optimal value
