import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MemoBody from "@/components/MemoView/components/MemoBody";

const mockState = vi.hoisted(() => ({
  memo: {
    name: "memos/1",
    content: "- [ ] first task",
    relations: [],
    attachments: [],
    reactions: [],
  },
  nextInstance: 0,
}));

vi.mock("@/components/MemoContent", () => ({
  default: ({ content }: { content: string }) => {
    const instance = useRef<number | null>(null);
    if (instance.current === null) {
      mockState.nextInstance += 1;
      instance.current = mockState.nextInstance;
    }
    return (
      <div data-testid="memo-content" data-instance={instance.current}>
        {content}
      </div>
    );
  },
}));

vi.mock("@/components/MemoMetadata", () => ({
  AttachmentListView: () => null,
  LocationDisplayView: () => null,
  RelationListView: () => null,
}));

vi.mock("@/components/MemoReactionListView", () => ({
  MemoReactionListView: () => null,
}));

vi.mock("@/components/MemoView/hooks", () => ({
  useMemoHandlers: () => ({
    handleMemoContentClick: vi.fn(),
    handleMemoContentDoubleClick: vi.fn(),
  }),
}));

vi.mock("@/components/MemoView/MemoViewContext", () => ({
  useMemoViewContext: () => ({
    memo: mockState.memo,
    parentPage: "",
    showBlurredContent: false,
    blurred: false,
    readonly: false,
    openEditor: vi.fn(),
    openPreview: vi.fn(),
    toggleBlurVisibility: vi.fn(),
  }),
}));

vi.mock("@/utils/i18n", () => ({
  useTranslate: () => (key: string) => key,
}));

describe("<MemoBody /> task content updates", () => {
  it("remounts the content renderer when content changes without an update-time change", () => {
    const { rerender } = render(<MemoBody compact={false} />);
    const initialContent = screen.getByTestId("memo-content");
    const initialInstance = initialContent.getAttribute("data-instance");

    mockState.memo = { ...mockState.memo, content: "- [x] first task" };
    rerender(<MemoBody compact={false} />);

    expect(screen.getByTestId("memo-content")).toHaveTextContent("- [x] first task");
    expect(screen.getByTestId("memo-content")).not.toHaveAttribute("data-instance", initialInstance);
  });
});
