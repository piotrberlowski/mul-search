import assert from 'node:assert/strict'
import test from 'node:test'
import { WORK_IN_PROGRESS_NAME, printListHeading, validateStoredListName } from '../../src/api/unitListApi'

test('work in progress print heading omits the name', () => {
    assert.equal(printListHeading('[Clan Wolf during ilClan]', WORK_IN_PROGRESS_NAME), '[Clan Wolf during ilClan]')
    assert.equal(printListHeading('[Clan Wolf during ilClan]', '  '), '[Clan Wolf during ilClan]')
})

test('named list print heading keeps the name', () => {
    assert.equal(printListHeading('[Clan Wolf during ilClan]', 'Raid'), '[Clan Wolf during ilClan] : Raid')
})

test('stored list names reject blanks and reserved labels', () => {
    assert.equal(validateStoredListName('  '), 'Enter a name.')
    assert.equal(validateStoredListName(WORK_IN_PROGRESS_NAME), 'Choose a name other than Work in Progress.')
    assert.equal(validateStoredListName('autosave'), 'Choose a different name.')
    assert.equal(validateStoredListName('Raid'), null)
})
