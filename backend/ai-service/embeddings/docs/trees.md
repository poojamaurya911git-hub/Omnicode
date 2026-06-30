# Trees — Competitive Programming Knowledge Base

## Binary Tree Traversals

Three classic traversals, each visiting nodes in different order.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    """Left → Root → Right (gives sorted order for BST)"""
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def preorder(root):
    """Root → Left → Right (used for serialization)"""
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def postorder(root):
    """Left → Right → Root (used for deletion)"""
    if not root: return []
    return postorder(root.left) + postorder(root.right) + [root.val]
```

## Binary Search Tree (BST)

BST property: left subtree values < node < right subtree values. All operations O(h) where h is height.

```python
def search_bst(root, target):
    if not root or root.val == target:
        return root
    if target < root.val:
        return search_bst(root.left, target)
    return search_bst(root.right, target)

def insert_bst(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert_bst(root.left, val)
    else:
        root.right = insert_bst(root.right, val)
    return root
```

## Segment Tree

Answers range queries and point updates in O(log n). Supports sum, min, max, GCD queries.

```python
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self._build(arr, 1, 0, self.n - 1)

    def _build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
            return
        mid = (start + end) // 2
        self._build(arr, 2*node, start, mid)
        self._build(arr, 2*node+1, mid+1, end)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]

    def update(self, idx, val, node=1, start=0, end=None):
        if end is None: end = self.n - 1
        if start == end:
            self.tree[node] = val
            return
        mid = (start + end) // 2
        if idx <= mid:
            self.update(idx, val, 2*node, start, mid)
        else:
            self.update(idx, val, 2*node+1, mid+1, end)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]

    def query(self, l, r, node=1, start=0, end=None):
        if end is None: end = self.n - 1
        if r < start or end < l:
            return 0
        if l <= start and end <= r:
            return self.tree[node]
        mid = (start + end) // 2
        return self.query(l, r, 2*node, start, mid) + \
               self.query(l, r, 2*node+1, mid+1, end)
```

## Fenwick Tree (Binary Indexed Tree)

Simpler alternative to segment tree for prefix sum queries and point updates. O(log n) for both operations.

```python
class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def update(self, i, delta):
        i += 1  # 1-indexed
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def prefix_sum(self, i):
        i += 1
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)
        return total

    def range_sum(self, l, r):
        return self.prefix_sum(r) - (self.prefix_sum(l - 1) if l > 0 else 0)
```

## Lowest Common Ancestor (LCA)

Binary lifting technique for O(log n) LCA queries after O(n log n) preprocessing.

```python
import math

def preprocess_lca(adj, root, n):
    LOG = int(math.log2(n)) + 1
    depth = [0] * n
    parent = [[-1] * n for _ in range(LOG)]

    # BFS to find depths and direct parents
    from collections import deque
    queue = deque([root])
    visited = [False] * n
    visited[root] = True
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                depth[v] = depth[u] + 1
                parent[0][v] = u
                queue.append(v)

    # Build sparse table
    for k in range(1, LOG):
        for v in range(n):
            if parent[k-1][v] != -1:
                parent[k][v] = parent[k-1][parent[k-1][v]]

    return depth, parent

def lca(u, v, depth, parent, LOG):
    if depth[u] < depth[v]:
        u, v = v, u
    diff = depth[u] - depth[v]
    for k in range(LOG):
        if (diff >> k) & 1:
            u = parent[k][u]
    if u == v:
        return u
    for k in range(LOG - 1, -1, -1):
        if parent[k][u] != parent[k][v]:
            u = parent[k][u]
            v = parent[k][v]
    return parent[0][u]
```

## Tree DP

DP on trees processes subtrees bottom-up. Classic example: maximum independent set.

```python
def tree_diameter(adj, n):
    """Find diameter of tree using two BFS passes."""
    def bfs_farthest(start):
        dist = [-1] * n
        dist[start] = 0
        queue = deque([start])
        farthest = start
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if dist[v] == -1:
                    dist[v] = dist[u] + 1
                    if dist[v] > dist[farthest]:
                        farthest = v
                    queue.append(v)
        return farthest, dist[farthest]

    far1, _ = bfs_farthest(0)
    far2, diameter = bfs_farthest(far1)
    return diameter
```

## Key Tree Patterns

1. **DFS/BFS traversal** for exploring tree structure
2. **Segment/Fenwick trees** for range queries with updates
3. **LCA** for path queries between nodes
4. **Tree DP** for optimization on subtrees
5. **Euler tour** to flatten tree into array for range queries
6. **Heavy-light decomposition** for path queries in O(log²n)
