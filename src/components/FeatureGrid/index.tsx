import React from 'react'

type Feature = {
  title: string
  text: string
}

type FeatureGridProps = {
  eyebrow: string
  heading: string
  features: Feature[]
}

export const FeatureGrid = ({
  eyebrow,
  heading,
  features,
}: FeatureGridProps) => {
  return (
    <section className="feature-grid">
      <div className="feature-grid-header">
        <div className="feature-grid-eyebrow">{eyebrow}</div>

        <h2 className="feature-grid-heading">{heading}</h2>
      </div>

      <div className="feature-grid-items">
        {features.map((feature) => (
          <article
            className="feature-grid-item"
            key={feature.title}
          >
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}