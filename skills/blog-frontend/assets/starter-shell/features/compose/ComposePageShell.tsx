import { AppLayout } from "../../components/shell/AppLayout";
import { PageContainer } from "../../components/shell/PageContainer";

export function ComposePageShell() {
  return (
    <AppLayout title="Write Article">
      <PageContainer>
        <form className="card-stack">
          <div className="card">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" placeholder="Article title" />
          </div>
          <div className="card">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="Write article content in markdown"
              rows={12}
            />
          </div>
          <div className="card">
            <label htmlFor="tags">Tags</label>
            <input id="tags" name="tags" placeholder="lens, blog" />
          </div>
          <div className="card">
            <button type="submit">Publish article</button>
          </div>
        </form>
      </PageContainer>
    </AppLayout>
  );
}
