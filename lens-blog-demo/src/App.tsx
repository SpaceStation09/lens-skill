import { useMemo, useRef, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";
import {
  checkOwnedAccounts,
  createLensAccount,
  fetchAuthorPosts,
  loginAsAccountOwner,
  publishArticle,
} from "./lib/lens";
import { getLensRuntimeConfig, resolveLensAppAddress } from "./config/lens";

type PostItem = {
  id: string;
  createdAt: string;
  title: string;
  content: string;
  contentUri: string;
  author: string;
};

export default function App() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const runtime = getLensRuntimeConfig();

  const [appAddressOverride, setAppAddressOverride] = useState("");
  const [accountAddress, setAccountAddress] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createUsername, setCreateUsername] = useState("");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createBio, setCreateBio] = useState("");
  const [title, setTitle] = useState("我的第一篇 Lens 博客");
  const [content, setContent] = useState("## 引言\n这是正文内容。\n\n## 结论\n感谢阅读。");
  const [tags, setTags] = useState("web3,lens,blog");
  const [queryAuthor, setQueryAuthor] = useState("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [status, setStatus] = useState("");

  const sessionClientRef = useRef<any>(null);

  const canUseLens = useMemo(() => Boolean(walletClient && isConnected), [walletClient, isConnected]);
  const resolvedAppAddress = useMemo(
    () => resolveLensAppAddress(runtime.network, appAddressOverride.trim() || undefined),
    [runtime.network, appAddressOverride]
  );

  async function onCheckAccounts() {
    if (!address) {
      setStatus("请先连接钱包。");
      return;
    }
    try {
      setStatus("正在检查该钱包绑定的 Lens 账户...");
      const result = await checkOwnedAccounts(address);
      const accounts = result.accounts;
      setStatus(
        `查询完成。当前网络(${result.selectedNetwork})账户数: ${result.selectedCount}；` +
          `另一网络(${result.alternateNetwork})账户数: ${result.alternateCount}`
      );
      if (accounts[0]?.address) {
        setAccountAddress(accounts[0].address);
      }
    } catch (error) {
      setStatus(`检查账户失败: ${String(error)}`);
    }
  }

  async function onLogin() {
    if (!walletClient || !accountAddress) {
      setStatus("请先连接钱包并填写 Account 地址。");
      return;
    }
    try {
      setStatus("正在以 Account Owner 登录 Lens...");
      const sessionClient = await loginAsAccountOwner({
        walletClient,
        appAddress: resolvedAppAddress,
        accountAddress,
      });
      sessionClientRef.current = sessionClient;
      setStatus("Lens 登录成功，现在可以发布博客。\n");
    } catch (error) {
      setStatus(`登录失败: ${String(error)}`);
    }
  }

  async function onCreateAccount() {
    if (!walletClient || !createUsername) {
      setStatus("请先连接钱包，并填写用户名。");
      return;
    }

    try {
      setStatus("正在创建 Lens 账户（Onboarding）...");
      const result = await createLensAccount({
        walletClient,
        appAddress: resolvedAppAddress,
        username: createUsername.trim(),
        displayName: createDisplayName.trim(),
        bio: createBio.trim(),
      });

      if (result.accountAddress) {
        setAccountAddress(result.accountAddress);
      }
      sessionClientRef.current = result.sessionClient;
      setStatus(
        `创建成功。txHash: ${result.txHash}${
          result.accountAddress ? `；Account: ${result.accountAddress}` : ""
        }`
      );
    } catch (error) {
      setStatus(`创建账户失败: ${String(error)}`);
    }
  }

  async function onPublish() {
    if (!walletClient || !sessionClientRef.current) {
      setStatus("请先完成 Lens 登录。");
      return;
    }

    try {
      setStatus("正在上传 metadata 并发布博客...");
      const result = await publishArticle({
        sessionClient: sessionClientRef.current,
        walletClient,
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setStatus(`发布成功，交易信息: ${JSON.stringify(result)}`);
    } catch (error) {
      setStatus(`发布失败: ${String(error)}`);
    }
  }

  async function onFetchPosts() {
    if (!queryAuthor) {
      setStatus("请输入作者地址。");
      return;
    }

    try {
      setStatus("正在拉取文章...");
      const data = await fetchAuthorPosts(queryAuthor);
      setPosts(data);
      setStatus(`拉取完成，共 ${data.length} 篇。`);
    } catch (error) {
      setStatus(`拉取失败: ${String(error)}`);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Lens Blog Demo</h1>
        <p>基于 Lens Protocol 的个人博客最小示例：连接钱包、登录账户、发文、查文。</p>
        <p className="hint">
          当前网络: {runtime.network} · 默认 App 地址: {resolvedAppAddress}
        </p>
        <ConnectKitButton />
        <p className="hint">钱包状态: {canUseLens ? "已连接" : "未连接"}</p>
        <button onClick={() => setShowAdvanced((v) => !v)}>
          {showAdvanced ? "隐藏高级设置" : "显示高级设置"}
        </button>
        {showAdvanced ? (
          <label>
            覆盖 App 地址（可选）
            <input
              value={appAddressOverride}
              onChange={(e) => setAppAddressOverride(e.target.value)}
              placeholder={runtime.appAddress}
            />
          </label>
        ) : null}
      </section>

      <section className="card">
        <h2>1) 登录前检查</h2>
        <button onClick={onCheckAccounts}>检查当前钱包的 Lens 账户</button>
      </section>

      <section className="card">
        <h2>2) 创建 Lens 账户（可选，适合 testnet）</h2>
        <label>
          用户名（localName）
          <input value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} placeholder="myblog" />
        </label>
        <label>
          显示名（可选）
          <input value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} placeholder="My Blog" />
        </label>
        <label>
          简介（可选）
          <input value={createBio} onChange={(e) => setCreateBio(e.target.value)} placeholder="Hello Lens" />
        </label>
        <button onClick={onCreateAccount}>创建 Lens 账户</button>
      </section>

      <section className="card">
        <h2>3) Account Owner 登录</h2>
        <p className="hint">登录时自动使用当前网络默认 App 地址（可在高级设置中覆盖）。</p>
        <label>
          Lens Account 地址
          <input value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} placeholder="0x..." />
        </label>
        <button onClick={onLogin}>登录 Lens</button>
      </section>

      <section className="card">
        <h2>4) 发布博客文章</h2>
        <label>
          标题
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          内容 (Markdown)
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
        </label>
        <label>
          标签（逗号分隔）
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <button onClick={onPublish}>发布到 Lens</button>
      </section>

      <section className="card">
        <h2>5) 拉取作者文章</h2>
        <label>
          作者地址
          <input value={queryAuthor} onChange={(e) => setQueryAuthor(e.target.value)} placeholder="0x..." />
        </label>
        <button onClick={onFetchPosts}>查询</button>

        <div className="post-list">
          {posts.map((post) => (
            <article key={post.id} className="post-item">
              <h3>{post.title}</h3>
              <p className="meta">
                {post.author} · {String(post.createdAt)}
              </p>
              <pre>{post.content}</pre>
            </article>
          ))}
        </div>
      </section>

      <section className="card status">
        <h2>状态</h2>
        <pre>{status || "暂无"}</pre>
      </section>
    </main>
  );
}
