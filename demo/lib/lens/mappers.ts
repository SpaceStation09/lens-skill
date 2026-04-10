import type { AccountView, MetadataAttributeView, PostView } from "@/lib/lens/contracts";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string");
}

function pickMediaUrl(value: unknown): string | null {
  const record = asRecord(value);
  if (!record) return asString(value);

  return asString(record.optimized) ?? asString(record.raw) ?? asString(record.uri) ?? asString(record.item);
}

function pickUsername(account: Record<string, unknown>): string | null {
  const username = asRecord(account.username);
  if (username) {
    return asString(username.localName) ?? asString(username.value);
  }

  const usernames = account.usernames;
  if (Array.isArray(usernames)) {
    for (const candidate of usernames) {
      const value = asRecord(candidate);
      const local = value ? asString(value.localName) ?? asString(value.value) : null;
      if (local) return local;
    }
  }

  return null;
}

function pickAttributes(metadata: Record<string, unknown> | null): MetadataAttributeView[] | null {
  const attributes = metadata?.attributes;
  if (!Array.isArray(attributes)) return null;

  const mapped = attributes
    .map((attribute) => {
      const item = asRecord(attribute);
      if (!item) return null;

      const key = asString(item.key);
      const type = asString(item.type);
      const value = asString(item.value);

      if (!key || !type || value === null) return null;

      return { key, type, value };
    })
    .filter((item): item is MetadataAttributeView => item !== null);

  return mapped.length ? mapped : null;
}

export function mapAccount(raw: unknown): AccountView | null {
  const root = asRecord(raw);
  const account = asRecord(root?.account) ?? root;
  if (!account) return null;

  const metadata = asRecord(account.metadata);
  const address = asString(account.address);
  if (!address) return null;

  return {
    address,
    username: pickUsername(account),
    name: asString(metadata?.name),
    bio: asString(metadata?.bio),
    picture: pickMediaUrl(metadata?.picture),
    coverPicture: pickMediaUrl(metadata?.coverPicture),
    attributes: pickAttributes(metadata),
  };
}

export function mapPost(raw: unknown): PostView | null {
  const post = asRecord(raw);
  if (!post) return null;

  const metadata = asRecord(post.metadata);
  const author = asRecord(post.author);
  const authorAddress = asString(author?.address) ?? asString(post.authorAddress) ?? "";
  const id = asString(post.id);
  if (!id || !authorAddress) return null;

  return {
    id,
    slug: asString(post.slug),
    authorAddress,
    title: asString(metadata?.title) ?? asString(post.title),
    content: asString(metadata?.content) ?? asString(post.content),
    tags: asStringArray(metadata?.tags) ?? asStringArray(post.tags),
    createdAt: asString(post.timestamp) ?? asString(post.createdAt),
  };
}
