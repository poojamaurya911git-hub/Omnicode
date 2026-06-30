# Graphs — Competitive Programming Knowledge Base

## Graph Representation

Adjacency list is preferred for sparse graphs (most competitive programming problems).

```python
from collections import defaultdict, deque

graph = defaultdict(list)
# For unweighted: graph[u].append(v)
# For weighted: graph[u].append((v, weight))
```

```cpp
vector<vector<int>> adj(n);          // unweighted
vector<vector<pair<int,int>>> adj(n); // weighted
```

## BFS (Breadth-First Search)

Finds shortest path in unweighted graphs. Time: O(V + E).

```python
def bfs(graph, start, n):
    dist = [-1] * n
    dist[start] = 0
    queue = deque([start])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist
```

## DFS (Depth-First Search)

Used for cycle detection, topological sort, connected components. Time: O(V + E).

```python
def dfs(graph, node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
```

Iterative DFS to avoid stack overflow:
```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return visited
```

## Dijkstra's Algorithm

Single-source shortest paths for non-negative weights. Time: O((V + E) log V).

```python
import heapq

def dijkstra(graph, start, n):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist
```

## Bellman-Ford Algorithm

Handles negative weights. Detects negative cycles. Time: O(V × E).

```python
def bellman_ford(edges, n, start):
    dist = [float('inf')] * n
    dist[start] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    # Check for negative cycle
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # Negative cycle exists
    return dist
```

## Floyd-Warshall Algorithm

All-pairs shortest paths. Time: O(V³). Space: O(V²).

```python
def floyd_warshall(n, edges):
    dist = [[float('inf')] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, w in edges:
        dist[u][v] = w
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist
```

## Topological Sort (Kahn's Algorithm)

For DAGs only. Used in dependency resolution, course scheduling.

```python
def topological_sort(graph, n):
    indegree = [0] * n
    for u in range(n):
        for v in graph[u]:
            indegree[v] += 1
    queue = deque([u for u in range(n) if indegree[u] == 0])
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    return order if len(order) == n else []  # Empty = cycle
```

## Union-Find (Disjoint Set Union)

Efficient component tracking with path compression and union by rank.

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True
```

## Key Graph Patterns

1. **BFS for shortest path** in unweighted graphs
2. **DFS for connectivity**, cycle detection, bridges, articulation points
3. **Dijkstra** for weighted shortest paths (no negative edges)
4. **DSU** for dynamic connectivity and Kruskal's MST
5. **Topological sort** for dependency ordering in DAGs
