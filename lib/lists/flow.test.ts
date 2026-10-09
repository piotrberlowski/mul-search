import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { isFailure } from '../../src/api/result'
import { savedListHref, shareHref, shareHrefFromMul } from '../../src/api/shareApi'
import { ISelectedUnit, Save, WORK_IN_PROGRESS_NAME, loadByName, loadLists, loadStagedList, parseId, rememberSave, stageList } from '../../src/api/unitListApi'

const memory = new Map<string, string>()
const localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value) },
    removeItem: (key: string) => { memory.delete(key) },
    clear: () => { memory.clear() },
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() { return memory.size },
}

const previousWindow = globalThis.window
Object.assign(globalThis, { window: globalThis, localStorage })

after(() => {
    Object.assign(globalThis, { window: previousWindow })
})

beforeEach(() => {
    memory.clear()
})

function sampleSave(nameNote = 'Atlas'): Save {
    return {
        units: [{
            Id: '42',
            Name: nameNote,
            skill: 4,
            lance: '',
            ordinal: 0,
            BFPointValue: 50,
            BFSize: 4,
        } as ISelectedUnit],
        constraints: '[Clan Wolf during ilClan]',
        eraId: 10,
        factionId: 20,
    }
}

test('parseId accepts finite numbers', () => {
    assert.equal(parseId(null), null)
    assert.equal(parseId(''), null)
    assert.equal(parseId('nope'), null)
    assert.equal(parseId('12'), 12)
})

test('share links keep a saved key separate from a snapshot', () => {
    assert.equal(savedListHref('abc def'), '/share?key=abc%20def')
    const href = shareHref({
        name: 'Raid',
        total: 50,
        units: sampleSave().units,
        constraints: '[Clan Wolf during ilClan]',
        eraId: 10,
        factionId: 20,
    })
    const params = new URLSearchParams(href.slice('/share?'.length))
    assert.equal(params.get('constraints'), '[Clan Wolf during ilClan]')
    assert.equal(params.get('era'), '10')
    assert.match(params.get('list') ?? '', /^Raid;50;42:4:Atlas:/)
    const mulHref = shareHrefFromMul({
        name: 'Raid',
        total: 50,
        constraints: '[Clan Wolf during ilClan]',
        eraId: null,
        factionId: null,
        units: [{ id: '42', skill: 4, name: 'Atlas', lance: '', ordinal: 0 }],
    })
    assert.match(mulHref, /list=Raid/)
    assert.equal(isFailure({ error: 'List not found.' }), true)
    assert.equal(isFailure({ value: 'key' }), false)
})

test('staging keeps a memory name without a server key', () => {
    stageList(sampleSave(), 'Raid', null)
    const staged = loadStagedList()
    assert.equal(staged.name, 'Raid')
    assert.equal(staged.serverKey, null)
    assert.equal(staged.save.constraints, '[Clan Wolf during ilClan]')
    assert.equal(staged.save.units[0]?.Name, 'Atlas')
})

test('remember stores a named copy and rejects reserved names', () => {
    const save = sampleSave()
    assert.equal(rememberSave(save, WORK_IN_PROGRESS_NAME), 'Choose a name other than Work in Progress.')
    assert.equal(rememberSave({ ...save, units: [] }, 'Raid'), 'Add units before remembering a list.')
    assert.equal(rememberSave(save, 'Raid'), null)
    assert.deepEqual(loadLists(), ['Raid'])
    assert.equal(loadByName('Raid').units[0]?.Name, 'Atlas')
    assert.equal(rememberSave(save, 'Raid'), null)
    assert.deepEqual(loadLists(), ['Raid'])
})
