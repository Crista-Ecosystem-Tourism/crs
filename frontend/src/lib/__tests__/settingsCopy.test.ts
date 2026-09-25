import { describe, expect, it } from 'vitest'
import { getAuthCopy, getNavigationCopy, getSettingsCopy } from '../settingsCopy'

describe('settings page translations', () => {
  it('provides a complete English copy for the settings page and delete dialog', () => {
    const copy = getSettingsCopy('en')

    expect(copy.title).toBe('Settings')
    expect(copy.languageNote).toContain('other sections are being localized')
    expect(copy.deleteAccountWarning).toContain('cannot be undone')
    expect(Object.values(copy).every((value) => value.length > 0)).toBe(true)
  })

  it('keeps Russian as the default-language copy', () => {
    expect(getSettingsCopy('ru').title).toBe('Настройки')
    expect(getSettingsCopy('ru').delete).toBe('Удалить')
  })

  it('uses the account language for shared navigation labels', () => {
    expect(getNavigationCopy('en').explore).toBe('Explore the world')
    expect(getNavigationCopy('en').accountSettings).toBe('Account settings')
    expect(getNavigationCopy('ru').explore).toBe('Изучение мира')
  })

  it('provides localized sign-in validation copy', () => {
    expect(getAuthCopy('en').requiredCredentials).toBe('Enter your email and password')
    expect(getAuthCopy('ru').shortPassword).toBe('Пароль минимум 6 символов')
  })
})
