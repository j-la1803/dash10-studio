import React from 'react'

type SplitContentProps = {
  eyebrow: string
  heading: string
  text: string
  image: string
  reverse?: boolean
}

export const SplitContent = ({
  eyebrow,
  heading,
  text,
  image,
  reverse = false,
}: SplitContentProps) => {
  return (
    <section
      className={`split-content ${
        reverse ? 'split-content-reverse' : ''
      }`}
    >
      <div className="split-content-media">
        <img
          src={image}
          alt=""
        />
      </div>

      <div className="split-content-copy">
        <div className="split-content-eyebrow">
          {eyebrow}
        </div>

        <h2 className="split-content-heading">
          {heading}
        </h2>

        <p className="split-content-text">
          {text}
        </p>
      </div>
    </section>
  )
}