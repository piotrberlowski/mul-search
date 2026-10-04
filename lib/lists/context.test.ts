import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { constraintNames, matchListContext } from './context'

const eras = [
  { id: 5, name: 'Jihad' },
  { id: 7, name: 'Dark Age' },
  { id: 11, name: 'Late Succession War – LosTech' },
]
const factions = [
  { id: 20, name: "Wolf's Dragoons" },
  { id: 4, name: 'Federated Suns' },
]

describe('constraintNames', () => {
  it('reads the specific faction and ignores the general list', () => {
    assert.deepEqual(
      constraintNames("[Wolf's Dragoons including Blank General List during Jihad]"),
      { faction: "Wolf's Dragoons", era: 'Jihad' },
    )
  })

  it('reads a faction and era with no general list', () => {
    assert.deepEqual(
      constraintNames('[Federated Suns during Dark Age]'),
      { faction: 'Federated Suns', era: 'Dark Age' },
    )
  })
})

describe('matchListContext', () => {
  it('resolves database ids and rewrites the label from those names', () => {
    assert.deepEqual(
      matchListContext("[Wolf's Dragoons including Blank General List during Jihad]", eras, factions),
      { eraId: 5, factionId: 20, label: "[Wolf's Dragoons during Jihad]" },
    )
  })

  it('treats a hyphen and an en dash as the same era name', () => {
    assert.equal(
      matchListContext('[Federated Suns during Late Succession War - LosTech]', eras, factions).eraId,
      11,
    )
  })

  it('leaves ids empty when the name is not in the database', () => {
    assert.deepEqual(
      matchListContext('[Unknown Faction during Jihad]', eras, factions),
      { eraId: 5, factionId: null, label: null },
    )
  })
})
