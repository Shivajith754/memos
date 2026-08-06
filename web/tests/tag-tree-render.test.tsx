import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import TagTree from "@/components/TagTree";

vi.mock("@/utils/i18n", () => ({ useTranslate: () => (key: string) => key }));

describe("TagTree rendering", () => {
  it("allows nested branches to be expanded and collapsed independently", () => {
    const onTagClick = vi.fn();
    const StatefulTagTree = () => {
      const [expandedTagPaths, setExpandedTagPaths] = useState<Set<string>>(() => new Set());

      return (
        <TagTree
          tagAmounts={[
            ["a", 2],
            ["a/b", 1],
            ["a/b/c", 1],
            ["getting-started", 1],
          ]}
          expandedTagPaths={expandedTagPaths}
          onTagClick={onTagClick}
          onToggleBranch={(tag) =>
            setExpandedTagPaths((current) => {
              const next = new Set(current);
              if (next.has(tag)) next.delete(tag);
              else next.add(tag);
              return next;
            })
          }
        />
      );
    };

    const { container } = render(<StatefulTagTree />);

    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
    expect(screen.queryByText("b")).not.toBeInTheDocument();
    expect(container.querySelector("svg.lucide-chevron-right")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.expand a" }));
    expect(screen.getAllByRole("treeitem")).toHaveLength(3);
    expect(screen.getByText("b")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "common.expand a/b" }));
    expect(screen.getAllByRole("treeitem")).toHaveLength(4);
    expect(screen.getByText("c")).toBeVisible();

    fireEvent.click(screen.getByText("b").closest("button") as HTMLButtonElement);
    expect(onTagClick).toHaveBeenCalledWith("a/b");

    fireEvent.click(screen.getByRole("button", { name: "common.collapse a/b" }));
    expect(screen.getAllByRole("treeitem")).toHaveLength(3);
    expect(screen.queryByText("c")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.collapse a" }));
    expect(screen.getAllByRole("treeitem")).toHaveLength(2);
    expect(screen.queryByText("b")).not.toBeInTheDocument();
  });
});
