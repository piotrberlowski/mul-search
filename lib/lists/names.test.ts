import assert from 'node:assert/strict'
import test from 'node:test'
import { printListHeading, validateStoredListName } from '../../src/api/unitListApi'

test('unnamed print heading omits the name', () => {
    assert.equal(printListHeading('[Clan Wolf during ilClan]', ''), '[Clan Wolf during ilClan]')
    assert.equal(printListHeading('[Clan Wolf during ilClan]', '  '), '[Clan Wolf during ilClan]')
})

test('named list print heading keeps the name', () => {
    assert.equal(printListHeading('[Clan Wolf during ilClan]', 'Raid'), '[Clan Wolf during ilClan] : Raid')
    assert.equal(printListHeading('[Clan Wolf during ilClan]', 'Work in Progress'), '[Clan Wolf during ilClan] : Work in Progress')
})

test('stored list names reject blanks', () => {
    assert.equal(validateStoredListName('  '), 'Enter a name.')
    assert.equal(validateStoredListName('autosave'), null)
    assert.equal(validateStoredListName('Work in Progress'), null)
    assert.equal(validateStoredListName('Raid'), null)
})
