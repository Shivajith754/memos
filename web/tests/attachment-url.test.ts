import { create } from "@bufbuild/protobuf";
import { afterEach, describe, expect, it } from "vitest";
import { AttachmentSchema } from "@/types/proto/api/v1/attachment_service_pb";
import { getAttachmentThumbnailUrl } from "@/utils/attachment";

const attachment = create(AttachmentSchema, {
  name: "attachments/image",
  filename: "image.png",
  type: "image/png",
});

describe("getAttachmentThumbnailUrl", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("includes the share token for anonymous shared-memo thumbnails", () => {
    window.history.pushState({}, "", "/memos/shares/share-token");

    expect(getAttachmentThumbnailUrl(attachment)).toBe(
      `${window.location.origin}/file/attachments/image/image.png?thumbnail=true&share_token=share-token`,
    );
  });

  it("does not add a share token outside a shared memo", () => {
    expect(getAttachmentThumbnailUrl(attachment)).toBe(`${window.location.origin}/file/attachments/image/image.png?thumbnail=true`);
  });

  it("preserves a share token already present on a same-origin attachment link", () => {
    const sharedAttachment = create(AttachmentSchema, {
      name: attachment.name,
      filename: attachment.filename,
      type: attachment.type,
      externalLink: `${window.location.origin}/file/attachments/image/image.png?share_token=share-token`,
    });

    expect(getAttachmentThumbnailUrl(sharedAttachment)).toBe(
      `${window.location.origin}/file/attachments/image/image.png?thumbnail=true&share_token=share-token`,
    );
  });
});
