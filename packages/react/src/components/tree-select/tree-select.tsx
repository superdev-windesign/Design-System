"use client";

import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button as AriaButton, Dialog as AriaDialog, DialogTrigger, Popover as AriaPopover } from "react-aria-components";
import type { Key } from "react-aria-components";
import { ChevronDownSmall } from "../../icons/chevrons";
import { focusRing } from "../../recipes/focus-ring";
import { FIELD_DESCRIPTION, FIELD_LABEL } from "../../recipes/field";
import { MENU_POPOVER_SURFACE } from "../../recipes/menu";
import { cx } from "../../utils/cx";
import { TreeView, TreeViewCollection, TreeViewItem } from "../tree-view/tree-view";

/**
 * TreeSelect: pick one value from a hierarchy (a folder, a category, an org
 * unit). The trigger shows the whole path ("Design / Brand / Logos"); the
 * popover holds a tree that opens on the current value, with the tree's
 * keyboard model (→ opens a branch, ← closes it, typing jumps to a label).
 *
 * With `selectLeavesOnly`, branches only open and close; just their leaves
 * can be chosen.
 */

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

/** The nodes from the root down to `id`, or [] when it isn't in the tree. */
export function treePath(nodes: TreeNode[], id: Key | null | undefined): TreeNode[] {
  if (id == null) return [];
  for (const node of nodes) {
    if (node.id === id) return [node];
    const below = node.children ? treePath(node.children, id) : [];
    if (below.length) return [node, ...below];
  }
  return [];
}

const branchIds = (nodes: TreeNode[]): string[] => nodes.flatMap((n) => (n.children?.length ? [n.id, ...branchIds(n.children)] : []));

export interface TreeSelectProps {
  label: ReactNode;
  items: TreeNode[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (id: string, path: TreeNode[]) => void;
  placeholder?: string;
  description?: ReactNode;
  /** Only leaves can be chosen. Default false. */
  selectLeavesOnly?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function TreeSelect({
  label,
  items,
  value: controlled,
  defaultValue = null,
  onChange,
  placeholder = "Choose…",
  description,
  selectLeavesOnly = false,
  isDisabled,
  className,
}: TreeSelectProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const value = controlled !== undefined ? controlled : uncontrolled;
  const [isOpen, setOpen] = useState(false);
  const path = useMemo(() => treePath(items, value), [items, value]);
  const branches = useMemo(() => branchIds(items), [items]);

  const renderNode = (node: TreeNode): ReactNode => (
    <TreeViewItem key={node.id} id={node.id} label={node.label}>
      {node.children?.length ? <TreeViewCollection items={node.children}>{renderNode}</TreeViewCollection> : null}
    </TreeViewItem>
  );

  return (
    <div className={cx("flex w-full flex-col gap-1", className)}>
      <span id={`${id}-label`} className={cx(FIELD_LABEL, "self-start")}>
        {label}
      </span>
      <DialogTrigger isOpen={isOpen} onOpenChange={setOpen}>
        <AriaButton
          ref={triggerRef}
          isDisabled={isDisabled}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={description ? `${id}-description` : undefined}
          className={cx(
            "flex h-control-md w-full cursor-pointer items-center gap-1.5 rounded-control-md border border-line-control bg-surface px-2.5 text-start text-body-md shadow-raised",
            "transition-colors duration-(--ds-motion-duration-base) data-[hovered]:border-line-control-hover data-[hovered]:bg-surface-hover",
            "data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-disabled data-[disabled]:text-fg-tertiary data-[disabled]:shadow-none",
            focusRing,
          )}
        >
          <span id={`${id}-value`} className="flex min-w-0 flex-1 items-center gap-1 truncate">
            {path.length ? (
              path.map((node, i) => (
                <span key={node.id} className={cx("truncate", i === path.length - 1 ? "text-fg" : "text-fg-secondary")}>
                  {node.label}
                  {i < path.length - 1 && <span className="ms-1 text-fg-tertiary">/</span>}
                </span>
              ))
            ) : (
              <span className="text-fg-tertiary">{placeholder}</span>
            )}
          </span>
          <ChevronDownSmall aria-hidden className={cx("size-4 shrink-0 text-fg-secondary transition-transform duration-(--ds-motion-duration-moderate)", isOpen && "rotate-180")} />
        </AriaButton>
        <AriaPopover triggerRef={triggerRef} placement="bottom start" offset={4} className={cx(MENU_POPOVER_SURFACE, "max-h-80 w-(--trigger-width) min-w-64 p-1.5")}>
          <AriaDialog aria-labelledby={`${id}-label`} className="outline-none">
            <TreeView
              aria-labelledby={`${id}-label`}
              items={items}
              autoFocus
              size="sm"
              showGuides={false}
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={value ? [value] : []}
              disabledKeys={selectLeavesOnly ? branches : undefined}
              disabledBehavior="selection"
              defaultExpandedKeys={path.slice(0, -1).map((n) => n.id)}
              onSelectionChange={(keys) => {
                const next = [...keys][0];
                if (next == null) return;
                const nextId = String(next);
                setUncontrolled(nextId);
                onChange?.(nextId, treePath(items, nextId));
                setOpen(false);
              }}
              className="rounded-none border-0 bg-transparent p-0"
            >
              {renderNode}
            </TreeView>
          </AriaDialog>
        </AriaPopover>
      </DialogTrigger>
      {description && (
        <p id={`${id}-description`} className={FIELD_DESCRIPTION}>
          {description}
        </p>
      )}
    </div>
  );
}
