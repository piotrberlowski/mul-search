import assert from 'node:assert/strict'
import test from 'node:test'
import { loadByName, loadLists, LOCAL_STORAGE_NAME_AUTOSAVE, saveByName } from '../../src/api/unitListApi'

function installLocalStorage() {
    const store = new Map<string, string>()
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
            getItem: (key: string) => store.has(key) ? store.get(key)! : null,
            setItem: (key: string, value: string) => { store.set(key, String(value)) },
            removeItem: (key: string) => { store.delete(key) },
        },
    })
}

test('empty autosave key replaces the legacy autosave slot', () => {
    installLocalStorage()
    localStorage.setItem('alphaStrikeList_autosave', JSON.stringify([{ Id: '1' }]))
    localStorage.setItem('alphaStrikeList_constraint_autosave', '[Clan Wolf during ilClan]')
    localStorage.setItem('alphaStrikeList_era_autosave', '12')
    localStorage.setItem('alphaStrikeList_faction_autosave', '34')
    localStorage.setItem('alphaStrikeLists', JSON.stringify(['autosave', 'Raid']))

    const session = loadByName(LOCAL_STORAGE_NAME_AUTOSAVE)

    assert.equal(LOCAL_STORAGE_NAME_AUTOSAVE, '')
    assert.equal(session.units.length, 1)
    assert.equal(session.constraints, '[Clan Wolf during ilClan]')
    assert.equal(session.eraId, 12)
    assert.equal(session.factionId, 34)
    assert.equal(localStorage.getItem('alphaStrikeList_autosave'), null)
    assert.equal(localStorage.getItem('alphaStrikeList_constraint_autosave'), null)
    assert.deepEqual(loadLists(), ['Raid'])

    saveByName({ units: [], constraints: 'named', eraId: 1, factionId: 2 }, 'autosave')
    const kept = loadByName(LOCAL_STORAGE_NAME_AUTOSAVE)
    assert.equal(kept.constraints, '[Clan Wolf during ilClan]')
    assert.equal(loadByName('autosave').constraints, 'named')
})
