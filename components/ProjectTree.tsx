// components/ProjectTree.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';

type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
};

type TreeState = {
  loading: boolean;
  error: string | null;
  nodes: FileNode[];
};

interface TreeNodeProps {
  node: FileNode;
  level: number;
  activeNodePath: string | null;
  setActiveNodePath: (path: string | null) => void;
  repoProvider: string;
  repoRoot: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  activeNodePath,
  setActiveNodePath,
  repoProvider,
  repoRoot,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [childrenState, setChildrenState] = useState<TreeState>({
    loading: false,
    error: null,
    nodes: [],
  });

  const hasChildren = node.type === 'directory';
  const isActive = activeNodePath === node.path;

  const handleToggle = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent click
    if (hasChildren) {
      setIsExpanded(!isExpanded);
      if (
        !isExpanded &&
        childrenState.nodes.length === 0 &&
        !childrenState.loading &&
        !childrenState.error
      ) {
        setChildrenState((prev) => ({ ...prev, loading: true }));
        try {
          const res = await fetch(
            `/api/fs-tree?path=${encodeURIComponent(node.path)}`,
            {
              headers: {
                'x-brewassist-repo-provider': repoProvider,
                'x-brewassist-repo-root': repoRoot,
              },
            }
          );
          if (!res.ok) {
            throw new Error(`fs-tree API returned ${res.status}`);
          }
          const data = await res.json();
          const nodes: FileNode[] = data?.nodes ?? [];
          setChildrenState({ loading: false, error: null, nodes });
        } catch (err: any) {
          setChildrenState({
            loading: false,
            error: err?.message ?? 'Failed to load directory',
            nodes: [],
          });
        }
      }
    } else {
      // This is a file, trigger onFileSelect
      setActiveNodePath(node.path);
      // Placeholder for actual file selection logic
      console.log('File selected:', node.path);
    }
  };

  const handleNodeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveNodePath(node.path);
    if (!hasChildren) {
      // Placeholder for actual file selection logic
      console.log('File selected:', node.path);
    }
  };

  const indicator = hasChildren ? (isExpanded ? '▾' : '▸') : '•'; // Updated glyphs

  return (
    <li
      className={`tree-item tree-item-level-${level} ${node.type} ${isActive ? 'tree-item-active' : ''} ${isHovered ? 'hover' : ''}`}
      data-level={level}
      style={{ paddingLeft: `${level * 0.75}rem` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="tree-indicator" onClick={handleToggle}>
        {indicator}
      </span>
      <span className="tree-name" onClick={handleNodeClick}>
        {node.name}
      </span>
      {isExpanded && hasChildren && (
        <ul className="tree-children">
          {childrenState.loading && <li className="tree-status">Loading…</li>}
          {childrenState.error && (
            <li className="tree-status tree-error">{childrenState.error}</li>
          )}
          {childrenState.nodes.map((childNode) => (
            <TreeNode
              key={childNode.path}
              node={childNode}
              level={level + 1}
              activeNodePath={activeNodePath}
              setActiveNodePath={setActiveNodePath}
              repoProvider={repoProvider}
              repoRoot={repoRoot}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const ProjectTree: React.FC = () => {
  const { repoProvider, repoRoot } = useRepoConnection();
  const [state, setState] = useState<TreeState>({
    loading: true,
    error: null,
    nodes: [],
  });
  const [activeNodePath, setActiveNodePath] = useState<string | null>(null); // Active node state

  useEffect(() => {
    const loadTree = async () => {
      try {
        const res = await fetch('/api/fs-tree?path=.', {
          headers: {
            'x-brewassist-repo-provider': repoProvider,
            'x-brewassist-repo-root': repoRoot,
          },
        });
        if (!res.ok) {
          throw new Error(`fs-tree API returned ${res.status}`);
        }
        const data = await res.json();
        const nodes: FileNode[] = data?.nodes ?? [];
        setState({ loading: false, error: null, nodes });
      } catch (err: any) {
        setState({
          loading: false,
          error: err?.message ?? 'Failed to load project tree',
          nodes: [],
        });
      }
    };

    void loadTree();
  }, [repoProvider, repoRoot]);

  if (state.loading) {
    return <div className="tree-status">Loading project…</div>;
  }

  if (state.error) {
    return (
      <div className="tree-status tree-error">[fs-tree] {state.error}</div>
    );
  }

  // Sort directories first, then files
  const sortedNodes = [...state.nodes].sort((a, b) => {
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <ul className="tree-root">
      {sortedNodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          level={0}
          activeNodePath={activeNodePath}
          setActiveNodePath={setActiveNodePath}
          repoProvider={repoProvider}
          repoRoot={repoRoot}
        />
      ))}
    </ul>
  );
};
