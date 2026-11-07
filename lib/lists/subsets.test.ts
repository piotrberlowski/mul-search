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
    const raid = 'atlas:4'
    saveSubListSelections(raid, [
        { key: 'b:4', header: 'Recon' },
        { key: 'a:4', header: '' },
    ])
    assert.deepEqual(loadSubListSelections(raid), [
        { key: 'b:4', header: 'Recon' },
        { key: 'a:4', header: '' },
    ])
    memory.set('alphaStrikeSubListSelections', 'not json')
    assert.deepEqual(loadSubListSelections(raid), [])
})

test('each list keeps its own selections', () => {
    saveSubListSelections('atlas:4', [{ key: 'atlas:4', header: 'Strike' }])
    saveSubListSelections('locust:4', [{ key: 'locust:4', header: 'Recon' }])
    assert.deepEqual(loadSubListSelections('atlas:4'), [{ key: 'atlas:4', header: 'Strike' }])
    assert.deepEqual(loadSubListSelections('locust:4'), [{ key: 'locust:4', header: 'Recon' }])
})

test('only the twenty most recently saved lists of selections are kept', () => {
    for (let i = 0; i < 20; i++) saveSubListSelections(`unit-${i}:4`, [{ key: `unit-${i}:4`, header: '' }])
    saveSubListSelections('unit-0:4', [{ key: 'unit-0:4', header: 'Kept' }])
    saveSubListSelections('unit-20:4', [{ key: 'unit-20:4', header: '' }])
    assert.deepEqual(loadSubListSelections('unit-0:4'), [{ key: 'unit-0:4', header: 'Kept' }])
    assert.deepEqual(loadSubListSelections('unit-1:4'), [])
    assert.deepEqual(loadSubListSelections('unit-20:4'), [{ key: 'unit-20:4', header: '' }])
})

test('a selection book with broken entries keeps the valid ones', () => {
    memory.set('alphaStrikeSubListSelections', JSON.stringify({
        lists: [
            { listKey: 'atlas:4', selections: [{ key: 'atlas:4', header: 'Strike' }, { key: 1 }, null] },
            { selections: [] },
            null,
        ],
    }))
    assert.deepEqual(loadSubListSelections('atlas:4'), [{ key: 'atlas:4', header: 'Strike' }])
})

test('selections stored before they were scoped per list are ignored', () => {
    memory.set('alphaStrikeSubListSelections', JSON.stringify([{ key: 'a:4', header: 'Old' }]))
    assert.deepEqual(loadSubListSelections('a:4'), [])
})
