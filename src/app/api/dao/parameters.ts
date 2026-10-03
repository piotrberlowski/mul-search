'use server'

import { parametersDao, type ParameterOption } from './parametersDao'

export async function getFactions(): Promise<ParameterOption[]> {
  return parametersDao.getFactions()
}
