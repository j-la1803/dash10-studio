import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types'

export function PostLinks({
  posts,
}: {
  posts: Pick<Post, 'id' | 'title' | 'slug' | 'categories' | 'excerpt' | 'meta' | 'publishedAt'>[]
}) {
  return (
    <div className="article-list">
      {posts.map((post) => (
        <article key={post.id} className="article-list-item">
          <div className="mono">
            {post.categories
              ?.flatMap((c) => (typeof c === 'object' && c.title ? [c.title] : []))
              .join(' / ')}
            {post.publishedAt && (
              <>
                {' '}
                ·{' '}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
              </>
            )}
          </div>
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          {(post.excerpt || post.meta?.description) && (
            <p>{post.excerpt || post.meta?.description}</p>
          )}
          <Link className="linkrow" href={`/posts/${post.slug}`}>
            Read article <span aria-hidden="true">↗</span>
          </Link>
        </article>
      ))}
    </div>
  )
}
export async function PublishedPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    limit: 1000,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      categories: true,
      excerpt: true,
      meta: true,
      publishedAt: true,
    },
  })
  return posts.docs.length ? (
    <PostLinks posts={posts.docs} />
  ) : (
    <div className="empty">
      <div className="mono">Status: drafting</div>
      <b>First posts are on the way.</b>
      <p className="lede" style={{ margin: 0 }}>
        Topics we will be writing about:
      </p>
      <ul className="tags rowtags">
        <li>Web development</li>
        <li>E-commerce</li>
        <li>Integrations</li>
        <li>Performance</li>
        <li>Working with existing platforms</li>
      </ul>
    </div>
  )
}
