import type { FormEvent, ReactNode } from "react";
import { ThemeFrame, type ThemeFooterAction } from "./ThemeFrame";

export function ComposeTemplate({
  title,
  content,
  tags,
  feedback,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSubmit,
  profileHref,
  sidebarPanel,
  footerActions,
  sidePanel,
}: {
  title: string;
  content: string;
  tags: string;
  feedback: string | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  profileHref: string;
  sidebarPanel?: ReactNode;
  footerActions?: ThemeFooterAction[];
  sidePanel?: ReactNode;
}) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <ThemeFrame
      mainClassName="monolith-main--compose"
      nav={[
        { label: "Home", href: "/" },
        { label: "Write", href: "/compose", active: true },
        { label: "Profile", href: profileHref },
      ]}
      sidebarPanel={sidebarPanel}
      footerActions={footerActions}
    >
      <form onSubmit={onSubmit}>
        <header className="compose-topbar">
          <p className="theme-kicker">Editor</p>
          <div className="compose-topbar__actions">
            <button type="submit" className="solid-button">
              Publish
            </button>
          </div>
        </header>

        <section className={sidePanel ? "compose-layout compose-layout--with-sidebar" : "compose-layout"}>
          <div className="compose-editor">
            <input
              aria-label="Entry title"
              className="compose-title-input"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Enter your article title"
            />

            <div className="compose-meta-grid">
              <label>
                <span>Tags</span>
                <input
                  value={tags}
                  onChange={(event) => onTagsChange(event.target.value)}
                  placeholder="design, writing, notes"
                />
              </label>
            </div>

            <div className="editor-surface">
              <div className="editor-toolbar" aria-hidden="true">
                <span>B</span>
                <span>I</span>
                <span>“”</span>
                <span>Link</span>
                <span>List</span>
              </div>
              <textarea
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                rows={16}
                placeholder="Start documenting with precision..."
              />
              <div className="editor-stats">
                <span>Words: {words}</span>
                <span>Chars: {content.length}</span>
                <span>Reading: {Math.max(1, Math.ceil(words / 200))}m</span>
              </div>
            </div>

            {feedback ? <p className="state-block state-block--error">{feedback}</p> : null}
          </div>

          {sidePanel ? <aside className="compose-sidebar">{sidePanel}</aside> : null}
        </section>
      </form>
    </ThemeFrame>
  );
}
