import * as prompts from 'prompts'

export async function confirm(message: string) {
  return await prompts({
    type: 'confirm',
    name: 'value',
    message: message,
    initial: false,
  })
}
