'use client'

import React, { useState } from 'react'

type AccordionItem = {
  title: string
  text: string
}

type AccordionProps = {
  eyebrow: string
  heading: string
  items: AccordionItem[]
}

export const Accordion = ({
  eyebrow,
  heading,
  items,
}: AccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="accordion-section">
      <div className="accordion-header">
        <div className="accordion-eyebrow">
          {eyebrow}
        </div>

        <h2 className="accordion-heading">
          {heading}
        </h2>
      </div>

      <div className="accordion-list">
        {items.map((item, index) => {
          const isOpen = openIndex === index

          return (
            <div
              className="accordion-item"
              key={item.title}
            >
              <button
                className="accordion-trigger"
                onClick={() => toggleItem(index)}
              >
                <span>{item.title}</span>
                <span>{isOpen ? '−' : '+'}</span>
              </button>

              {isOpen && (
                <div className="accordion-content">
                  <p>{item.text}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}