export type ThemeProfileView = {
  address: string;
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  picture?: string | null;
  coverPicture?: string | null;
  attributes?: unknown[] | null;
};

export type ThemePostView = {
  id: string;
  title?: string | null;
  content?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
};
