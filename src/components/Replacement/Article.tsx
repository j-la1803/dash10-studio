import Link from 'next/link'
import type { Post } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { ArticleShell } from './Template'
import { PostLinks } from './PublishedPosts'
import { formatAuthors } from '@/utilities/formatAuthors'

/** Every current/future Payload post uses this template; no content or relationships are rewritten. */
export function DesignArticle({ post }: { post: Post }) {
  const categories =
    post.categories?.flatMap((category) =>
      typeof category === 'object' && category.title ? [category.title] : [],
    ) || []
  const authors = post.populatedAuthors?.length ? formatAuthors(post.populatedAuthors) : ''
  const related =
    post.relatedPosts?.filter(
      (related): related is Post => typeof related === 'object' && related !== null,
    ) || []
  return (
    <ArticleShell>
      <main id="main-content">
        <article>
          <header className="sub-hero grid">
            <div className="wrap" style={{ position: 'relative' }}>
              <div className="mono article-back">
                <Link href="/blog">← Field notes</Link>
              </div>
              <div className="mono" style={{ marginBottom: 22 }}>
                {categories.join(' / ') || 'Blog'}
              </div>
              <h1 className="article-title glitch" data-text={post.title} aria-label={post.title}>
                {post.title}
              </h1>
              {post.excerpt && <p className="lede">{post.excerpt}</p>}
              <div className="mono article-meta">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                )}
                {authors && <span>{authors}</span>}
              </div>
              {post.heroImage && typeof post.heroImage === 'object' && (
                <figure className="article-figure">
                  <Media resource={post.heroImage} />
                </figure>
              )}
            </div>
          </header>
          <section className="grid">
            <div className="wrap">
              <RichText
                className="article-reading"
                data={post.content}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          </section>
          {related.length > 0 && (
            <aside className="grid">
              <div className="wrap article-related">
                <div className="mono">Related articles</div>
                <PostLinks posts={related} />
              </div>
            </aside>
          )}
        </article>
      </main>
    </ArticleShell>
  )
}
