import { ChevronRightIcon, HashIcon } from "lucide-react";
import { useMemo } from "react";
import { useOverflowTitle } from "@/hooks";
import { cn } from "@/lib/utils";
import { useTranslate } from "@/utils/i18n";

interface TagTreeNode {
  key: string;
  text: string;
  amount?: number;
  subTags: TagTreeNode[];
}

interface Props {
  tagAmounts: [tag: string, amount: number][];
  activeTag?: string;
  expandedTagPaths: ReadonlySet<string>;
  onTagClick: (tag: string) => void;
  onToggleBranch: (tag: string) => void;
}

export const buildTagTree = (tagAmounts: [tag: string, amount: number][]) => {
  const root: TagTreeNode = {
    key: "",
    text: "",
    subTags: [],
  };

  for (const [tag, amount] of [...tagAmounts].sort(([left], [right]) => left.localeCompare(right))) {
    const segments = tag.split("/");
    let parent = root;
    let path = "";

    segments.forEach((segment, index) => {
      path = path ? `${path}/${segment}` : segment;
      let node = parent.subTags.find((item) => item.key === segment);

      if (!node) {
        node = {
          key: segment,
          text: path,
          subTags: [],
        };
        parent.subTags.push(node);
      }

      if (index === segments.length - 1) {
        node.amount = amount;
      }
      parent = node;
    });
  }

  return root.subTags;
};

const TagMark = () => <HashIcon aria-hidden="true" className="size-3 text-muted-foreground/65" strokeWidth={1.75} />;

interface TagItemProps {
  tag: TagTreeNode;
  depth: number;
  activeTag?: string;
  expandedTagPaths: ReadonlySet<string>;
  onTagClick: (tag: string) => void;
  onToggleBranch: (tag: string) => void;
}

const TagItem = ({ tag, depth, activeTag, expandedTagPaths, onTagClick, onToggleBranch }: TagItemProps) => {
  const t = useTranslate();
  const isTag = tag.amount !== undefined;
  const isActive = activeTag === tag.text;
  const isAncestorOfActiveTag = activeTag?.startsWith(`${tag.text}/`) ?? false;
  const hasSubTags = tag.subTags.length > 0;
  const showSubTags = expandedTagPaths.has(tag.text);
  const { ref: labelRef, title } = useOverflowTitle<HTMLSpanElement>(isTag ? `#${tag.text}` : tag.text);

  return (
    <div className="w-full min-w-0">
      <div
        role="treeitem"
        aria-expanded={hasSubTags ? showSubTags : undefined}
        aria-level={depth + 1}
        aria-selected={isActive || undefined}
        className={cn(
          "relative flex h-[26px] w-full min-w-0 items-center rounded-[5px] pr-2 text-xs leading-4 transition-colors",
          isTag ? "text-muted-foreground hover:bg-sidebar-accent/65 hover:text-foreground" : "font-medium text-muted-foreground/65",
          isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:bg-sidebar-accent",
          isAncestorOfActiveTag && !isActive && "text-foreground/75",
        )}
        style={{ paddingInlineStart: 8 + depth * 14 }}
      >
        {hasSubTags ? (
          <button
            type="button"
            aria-label={`${showSubTags ? t("common.collapse") : t("common.expand")} ${tag.key}`}
            aria-expanded={showSubTags}
            className="mr-0.5 flex size-5 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground/75 transition-colors hover:bg-background/70 hover:text-foreground focus-visible:bg-background/70 focus-visible:text-foreground focus-visible:outline-none"
            onClick={() => onToggleBranch(tag.text)}
          >
            <ChevronRightIcon className={cn("size-3 transition-transform duration-150", showSubTags && "rotate-90")} strokeWidth={1.8} />
          </button>
        ) : (
          <span className="mr-0.5 size-5 shrink-0" />
        )}

        {isTag ? (
          <button
            type="button"
            aria-pressed={isActive || undefined}
            title={title}
            className="grid h-full min-w-0 flex-1 grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-x-1.5 rounded-sm text-left focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
            onClick={() => onTagClick(tag.text)}
          >
            <TagMark />
            <span ref={labelRef} className="min-w-0 flex-1 truncate">
              {tag.key}
            </span>
            <span
              className={cn("shrink-0 leading-none tabular-nums text-muted-foreground/50", isActive && "text-sidebar-accent-foreground/65")}
            >
              {tag.amount}
            </span>
          </button>
        ) : (
          <span ref={labelRef} className="min-w-0 flex-1 truncate ps-[18px]" title={title}>
            {tag.key}
          </span>
        )}
      </div>

      {hasSubTags && showSubTags && (
        <div className="mt-px flex w-full min-w-0 flex-col gap-px" role="group">
          {tag.subTags.map((subTag) => (
            <TagItem
              key={subTag.text}
              tag={subTag}
              depth={depth + 1}
              activeTag={activeTag}
              expandedTagPaths={expandedTagPaths}
              onTagClick={onTagClick}
              onToggleBranch={onToggleBranch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TagTree = ({ tagAmounts, activeTag, expandedTagPaths, onTagClick, onToggleBranch }: Props) => {
  const t = useTranslate();
  const tags = useMemo(() => buildTagTree(tagAmounts), [tagAmounts]);

  return (
    <div className="relative flex h-auto w-full flex-col items-stretch gap-px" role="tree" aria-label={t("common.tags")}>
      {tags.map((tag) => (
        <TagItem
          key={tag.text}
          tag={tag}
          depth={0}
          activeTag={activeTag}
          expandedTagPaths={expandedTagPaths}
          onTagClick={onTagClick}
          onToggleBranch={onToggleBranch}
        />
      ))}
    </div>
  );
};

export default TagTree;
