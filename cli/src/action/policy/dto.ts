interface PolicyRule {
  collectionName: string
  rules: Rules
}

interface Rules {
  read: boolean
  count: boolean
  update: boolean
  remove: boolean
  add: boolean
}
