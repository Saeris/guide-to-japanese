// Copied from https://github.com/fuma-nama/fumadocs/blob/3f3e9429dd78c061e75af5abfc74fe5732f89e04/packages/core/src/server/git-api.ts

type Response = Array<{
  html_url: string;
  commit: {
    committer: {
      date: string;
    };
  };
}>;

export interface GetLastEditTimeOptions {
  /**
   * Repository name, like "fumadocs"
   */
  repo: string;

  /** Owner of repository */
  owner: string;

  /**
   * Path to file
   */
  path: string;

  /**
   * Github access token
   */
  token?: string;

  /**
   * Custom query parameters
   */
  params?: Record<string, string>;

  options?: RequestInit;
}

/**
 * Get the last edit time of a file
 */
export async function getLastEditTime({
  repo,
  token,
  owner,
  path,
  options = {},
  params: customParams = {}
}: GetLastEditTimeOptions): Promise<{ url: string; date: Date } | null> {
  const params = new URLSearchParams();
  params.set(`path`, path);
  params.set(`page`, `1`);
  params.set(`per_page`, `1`);

  for (const [key, value] of Object.entries(customParams)) {
    params.set(key, value);
  }

  if (token) {
    options.headers = new Headers(options.headers);
    options.headers.append(`authorization`, token);
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`,
    options
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch last edit time from Git ${await res.text()}`
    );
  }
  const data = (await res.json()) as Response;

  if (data.length === 0) return null;
  return {
    url: data[0].html_url,
    date: new Date(data[0].commit.committer.date)
  };
}
