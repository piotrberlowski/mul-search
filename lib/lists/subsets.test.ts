import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { generateSubsets, represent, restoreSubset } from '../../src/api/subsets'
import { ISelectedUnit, loadSubListSelections, saveSubListSelections } from '../../src/api/unitListApi'
import { installMemoryStorage } from './memoryStorage'

const memory = installMemoryStorage()

beforeEach(() => {
    memory.clear()
})

function unit(Id: string, skill: number, ordinal: number, lance = ''): ISelectedUnit {
    return { Id, Name: Id, skill, ordinal, lance, BFPointValue: 40, BFSize: 3 } as ISelectedUnit
}

test('sub-lists are the largest picks inside the PV range, without duplicates', () => {
    const units = [unit('atlas', 4, 0), unit('atlas', 4, 1), unit('locust', 4, 2)]
    assert.deepEqual(generateSubsets(units, 80, 80).map(represent), ['atlas:4,locust:4', 'atlas:4,atlas:4'])
    assert.deepEqual(generateSubsets(units, 200, 300), [])
})

test('an empty PV bound generates nothing', () => {
    const units = [unit('atlas', 4, 0), unit('locust', 4, 1)]
    assert.deepEqual(generateSubsets(units, NaN, 100), [])
    assert.deepEqual(generateSubsets(units, 0, NaN), [])
})

test('a sub-list key ignores unit order and lance', () => {
    assert.equal(
        represent([unit('atlas', 4, 0, 'A'), unit('locust', 3, 1)]),
        represent([unit('locust', 3, 5, 'B'), unit('atlas', 4, 2)]),
    )
})

test('restoring a sub-list picks matching units, including duplicates', () => {
    const units = [unit('atlas', 4, 0), unit('atlas', 4, 1), unit('locust', 3, 2)]
    const restored = restoreSubset(represent([units[0], units[1]]), units)
    assert.deepEqual(restored?.map(u => u.ordinal).sort(), [0, 1])
})

test('a sub-list is orphaned once one of its units leaves the list or changes skill', () => {
    const units = [unit('atlas', 4, 0), unit('locust', 3, 1)]
    const key = represent([unit('atlas', 4, 0), unit('atlas', 4, 1)])
    assert.equal(restoreSubset(key, units), null)
    assert.equal(restoreSubset(represent([unit('locust', 4, 1)]), units), null)
})

test('stored selections keep their order and headers only', () => {
    saveSubListSelections([
        { key: 'b:4', header: 'Recon' },
        { key: 'a:4', header: '' },
    ])
    assert.deepEqual(loadSubListSelections(), [
        { key: 'b:4', header: 'Recon' },
        { key: 'a:4', header: '' },
    ])
    memory.set('alphaStrikeSubListSelections', 'not json')
    assert.deepEqual(loadSubListSelections(), [])
})
