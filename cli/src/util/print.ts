import * as emoji  from 'node-emoji'

export function getEmoji(value: any) {
  return emoji.get(emoji.find(value).key)
}

