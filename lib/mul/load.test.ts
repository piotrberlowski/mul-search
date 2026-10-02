import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { expandAvailability } from './availability'
import { parseSitemap } from './sitemap'

describe('expandAvailability', () => {
  it('expands era/dict pairs through the faction-set dictionary', () => {
    const rows = expandAvailability({
      d: [[1], [2, 3], [4]],
      u: {
        ABC: [[10, 1], [11, 0]],
        DEF: [[10, 2]],
      },
    })
    assert.deepEqual(rows, [
      { unitId: 'ABC', eraId: 10, factionId: 2 },
      { unitId: 'ABC', eraId: 10, factionId: 3 },
      { unitId: 'ABC', eraId: 11, factionId: 1 },
      { unitId: 'DEF', eraId: 10, factionId: 4 },
    ])
  })
})

describe('parseSitemap', () => {
  it('reads unit slugs and lastmod from a urlset', () => {
    const entries = parseSitemap(`<?xml version="1.0" encoding="UTF-8"?>
      <urlset>
        <url>
          <loc>https://masterunitlist.battletech.com/units/black-knight-bl-7-knt</loc>
          <lastmod>2026-03-01</lastmod>
        </url>
        <url>
          <loc>https://masterunitlist.battletech.com/factions/clan-wolf</loc>
        </url>
      </urlset>`)
    assert.equal(entries.length, 1)
    assert.equal(entries[0].slug, 'black-knight-bl-7-knt')
    assert.equal(entries[0].lastMod?.toISOString().startsWith('2026-03-01'), true)
  })
})
