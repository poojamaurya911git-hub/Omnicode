# Greedy Algorithms — Competitive Programming Knowledge Base

## Core Principle

Greedy algorithms make the locally optimal choice at each step, hoping to find a global optimum. They work when the problem exhibits the greedy-choice property and optimal substructure.

## Activity Selection Problem

Select maximum number of non-overlapping activities. Sort by end time, greedily pick earliest-ending activity.

```python
def activity_selection(activities):
    """activities = [(start, end), ...]"""
    activities.sort(key=lambda x: x[1])  # Sort by end time
    selected = [activities[0]]
    last_end = activities[0][1]

    for start, end in activities[1:]:
        if start >= last_end:
            selected.append((start, end))
            last_end = end

    return selected
```

```cpp
int activitySelection(vector<pair<int,int>>& acts) {
    sort(acts.begin(), acts.end(),
         [](auto& a, auto& b) { return a.second < b.second; });
    int count = 1, lastEnd = acts[0].second;
    for (int i = 1; i < acts.size(); i++) {
        if (acts[i].first >= lastEnd) {
            count++;
            lastEnd = acts[i].second;
        }
    }
    return count;
}
```

## Interval Scheduling Maximization

Variant of activity selection. Given intervals, find maximum non-overlapping set.

**Key insight:** Always pick the interval that ends earliest — this leaves the most room for future intervals.

## Interval Partitioning

Find minimum number of resources to schedule all intervals.

```python
import heapq

def min_rooms(intervals):
    """Minimum meeting rooms needed."""
    intervals.sort(key=lambda x: x[0])
    heap = []  # min-heap of end times
    for start, end in intervals:
        if heap and heap[0] <= start:
            heapq.heappop(heap)
        heapq.heappush(heap, end)
    return len(heap)
```

## Huffman Coding

Build optimal prefix-free code for data compression using a priority queue.

```python
import heapq

def huffman_encoding(frequencies):
    """frequencies = {'a': 5, 'b': 9, 'c': 12, ...}"""
    heap = [(freq, char) for char, freq in frequencies.items()]
    heapq.heapify(heap)

    if len(heap) == 1:
        return {heap[0][1]: '0'}

    while len(heap) > 1:
        freq1, left = heapq.heappop(heap)
        freq2, right = heapq.heappop(heap)
        heapq.heappush(heap, (freq1 + freq2, (left, right)))

    # Build codes from tree
    codes = {}
    def build_codes(node, code=''):
        if isinstance(node, str):
            codes[node] = code or '0'
            return
        build_codes(node[0], code + '0')
        build_codes(node[1], code + '1')

    build_codes(heap[0][1])
    return codes
```

## Fractional Knapsack

Unlike 0/1 knapsack, items can be split. Greedy by value/weight ratio works optimally.

```python
def fractional_knapsack(capacity, items):
    """items = [(value, weight), ...]"""
    # Sort by value/weight ratio descending
    items.sort(key=lambda x: x[0]/x[1], reverse=True)
    total_value = 0

    for value, weight in items:
        if capacity >= weight:
            total_value += value
            capacity -= weight
        else:
            total_value += value * (capacity / weight)
            break

    return total_value
```

## Jump Game

Determine if you can reach the last index, where each element is max jump length.

```python
def can_jump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True

def min_jumps(nums):
    """Minimum jumps to reach end."""
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps
```

## When Greedy Works

Greedy is correct when:
1. **Greedy-choice property**: A globally optimal solution can be arrived at by making locally optimal choices
2. **Optimal substructure**: An optimal solution contains optimal solutions to subproblems
3. **Exchange argument**: Any non-greedy solution can be improved by swapping to the greedy choice

## Common Greedy Patterns

1. **Sort + sweep** — sort by some criteria, sweep linearly
2. **Priority queue** — always process the best option
3. **Interval problems** — sort by start/end, sweep
4. **Coin change (canonical)** — use largest denomination first
5. **Minimum spanning tree** — Kruskal's (sort edges) or Prim's (priority queue)
6. **Task scheduling** — sort by deadline or penalty
