import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import { parseUnitPage } from './parseUnitPage'
import type { ParsedUnitPage } from './types'

function fixture(name: string): string {
  return readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', name), 'utf8')
}

function expectPage(name: string, expected: ParsedUnitPage) {
  assert.deepEqual(parseUnitPage(fixture(name)), expected)
}

describe('parseUnitPage', () => {
  it('parses a BattleMech stats block', () => {
    expectPage('battlemech.html', {
      slug: 'black-knight-bl-7-knt',
      hasCard: true,
      cardVersion: '52e7d86fde',
      imageUrl: 'https://masterunitlist.battletech.com/point-backs/unit-art/manual/black-knight-a5d468.webp',
      pv: 34,
      size: 3,
      move: '8"',
      tmm: 1,
      armor: 6,
      structure: 6,
      threshold: null,
      overheat: 2,
      dmgS: '3',
      dmgM: '3',
      dmgL: '1',
      dmgE: '0',
      specials: 'ENE',
    })
  })

  it('keeps starred damage and skips the role chip', () => {
    expectPage('industrialmech.html', {
      slug: 'cattlemaster-ctl-3r3-securitymech',
      hasCard: true,
      cardVersion: 'cdf87e4d74',
      imageUrl: null,
      pv: 12,
      size: 1,
      move: '8"',
      tmm: 1,
      armor: 2,
      structure: 2,
      threshold: null,
      overheat: null,
      dmgS: '2',
      dmgM: '1',
      dmgL: '0*',
      dmgE: '0',
      specials: 'AFC, FC, IF 0*',
    })
  })

  it('treats em-dash TMM and armor as null', () => {
    const armorless = parseUnitPage(fixture('support-vehicle.html'))
    assert.equal(armorless.tmm, 3)
    assert.equal(armorless.armor, null)
    assert.equal(armorless.move, '16"t')
    assert.equal(armorless.specials, 'DRO, EE, ENE')

    const battleArmor = parseUnitPage(fixture('battle-armor.html'))
    assert.equal(battleArmor.tmm, null)
  })

  it('reads threshold on aerospace and fighter pages', () => {
    const aero = parseUnitPage(fixture('aerospace-craft.html'))
    assert.equal(aero.threshold, 1)
    assert.equal(aero.move, '3p')
    assert.equal(aero.specials, null)

    const fighter = parseUnitPage(fixture('fighter-craft.html'))
    assert.equal(fighter.threshold, 1)
    assert.equal(fighter.move, '9a')
    assert.equal(fighter.specials, 'ATMO, BOMB 1, EE, VSTOL')
  })

  it('keeps battle armor cargo values and ignores the role', () => {
    const page = parseUnitPage(fixture('battle-armor.html'))
    assert.equal(page.tmm, null)
    assert.equal(page.specials, 'CAR 5')
    assert.equal(page.cardVersion, '481604e4b4')
  })

  it('marks buildings as having no card', () => {
    const page = parseUnitPage(fixture('buildings.html'))
    assert.equal(page.hasCard, false)
    assert.equal(page.cardVersion, null)
    assert.equal(page.slug, 'fortified-command-post-age-of-war')
    assert.equal(page.dmgS, '4')
    assert.match(page.specials ?? '', /TUR2 \(1\/1\/1,AC0\*\/1\/1,ARTT-1\)/)
  })

  it('parses remaining unit types', () => {
    const vehicle = parseUnitPage(fixture('combat-vehicle.html'))
    assert.equal(vehicle.dmgS, '0*')
    assert.equal(vehicle.move, '10"t')
    assert.equal(vehicle.specials, 'CT 3, EE, HTC, SRCH, TUR (0*/-/-)')

    const infantry = parseUnitPage(fixture('infantry.html'))
    assert.equal(infantry.move, '6"w')
    assert.equal(infantry.specials, 'CAR 24')

    const omni = parseUnitPage(fixture('omnivehicle.html'))
    assert.equal(omni.pv, 25)
    assert.equal(omni.specials, 'CASE, IT 12, OMNI, SRCH, SRM 2/2, TUR (2/2/-,SRM2/2)')

    const proto = parseUnitPage(fixture('protomech.html'))
    assert.equal(proto.move, '12"')
    assert.equal(proto.specials, null)

    const satellite = parseUnitPage(fixture('advanced-support.html'))
    assert.equal(satellite.move, '0.2k')
    assert.equal(satellite.specials, 'ARS, RBT')
  })
})
