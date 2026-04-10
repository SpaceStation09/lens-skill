export type LensResult<T> = {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details?: unknown;
  } | null;
  meta: {
    cursor?: string | null;
    nextCursor?: string | null;
    hasMore?: boolean;
    source: "lens";
    timestamp: string;
  };
};

export type LensPage<T> = {
  items: T[];
  pageInfo: {
    prev: string | null;
    next: string | null;
  };
};

export type MetadataAttributeView = {
  key: string;
  type: string;
  value: string;
};

export type AccountView = {
  address: string;
  username?: string | null;
  name?: string | null;
  bio?: string | null;
  picture?: string | null;
  coverPicture?: string | null;
  attributes?: MetadataAttributeView[] | null;
};

export type AuthSessionView = {
  authenticationId: string;
  accountAddress?: string | null;
  app?: string | null;
};

export type PostView = {
  id: string;
  slug?: string | null;
  authorAddress: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
};
