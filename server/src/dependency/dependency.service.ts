import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RUNTIME_BUILTIN_DEPENDENCIES } from 'src/runtime-builtin-deps'
import * as npa from 'npm-package-arg'
import { CreateDependencyDto } from './dto/create-dependency.dto'
import { UpdateDependencyDto } from './dto/update-dependency.dto'

export class Dependency {
  name: string
  spec: string
  type: string
  builtin: boolean
}

@Injectable()
export class DependencyService {
  private readonly logger = new Logger(DependencyService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get app merged dependencies in `Dependency` array
   * @param appid
   * @returns
   */
  async getMergedObjects(appid: string): Promise<Dependency[]> {
    const extra_arr = await this.getExtras(appid)
    const builtin_arr = this.getBuiltins()

    const extras = extra_arr.map((dep) => {
      const { name, fetchSpec, type } = npa(dep)
      return { name, spec: fetchSpec, type, builtin: false } as Dependency
    })

    const builtins = builtin_arr.map((dep) => {
      const { name, fetchSpec, type } = npa(dep)
      return { name, spec: fetchSpec, type, builtin: true } as Dependency
    })

    const deps = extras.concat(builtins)
    return Object.values(deps)
  }

  async add(appid: string, dto: CreateDependencyDto[]) {
    // validate
    const valid = dto.every((dep) => this.validate(dep))
    if (!valid) return false

    const extras = await this.getExtras(appid)
    const builtins = this.getBuiltins()
    const all = extras.concat(builtins)

    // check if the dependency name is already existed
    const names = all.map((dep) => npa(dep).name)
    const new_names = dto.map((dep) => npa(dep.name).name)
    const has_dup = new_names.some((name) => names.includes(name))
    if (has_dup) return false

    // add
    const new_deps = dto.map((dep) => `${dep.name}@${dep.spec}`)
    const deps = extras.concat(new_deps)
    await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { dependencies: deps },
    })

    return true
  }

  /**
   * Update the dependencies' version
   */
  async update(appid: string, dto: UpdateDependencyDto[]) {
    const extras = await this.getExtras(appid)

    // check if the dependency name all valid
    const names = extras.map((dep) => npa(dep).name)
    const input_names = dto.map((dep) => npa(dep.name).name)
    const has_invalid = input_names.some((name) => !names.includes(name))
    if (has_invalid) return false

    // update
    const new_deps = dto.map((dep) => `${dep.name}@${dep.spec}`)
    const filtered = extras.filter((dep) => {
      const { name } = npa(dep)
      return !input_names.includes(name)
    })

    const deps = filtered.concat(new_deps)
    await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { dependencies: deps },
    })

    return true
  }

  async remove(appid: string, name: string) {
    const deps = await this.getExtras(appid)
    const filtered = deps.filter((dep) => {
      const r = npa(dep)
      return r.name !== name
    })

    if (filtered.length === deps.length) return false

    await this.prisma.applicationConfiguration.update({
      where: { appid },
      data: { dependencies: filtered },
    })
    return true
  }

  /**
   * Get the extra dependencies in string array
   * @param appid
   * @returns
   */
  private async getExtras(appid: string) {
    const conf = await this.prisma.applicationConfiguration.findUnique({
      where: { appid },
    })

    const deps = conf?.dependencies ?? []
    return deps
  }

  /**
   * Get the built-in dependencies in string array
   * @returns
   */
  private getBuiltins() {
    const obj = RUNTIME_BUILTIN_DEPENDENCIES
    return Object.keys(obj).map((key) => `${key}@${obj[key]}`)
  }

  private validate(dto: CreateDependencyDto) {
    try {
      npa.resolve(dto.name, dto.spec)
      return true
    } catch (error) {
      return false
    }
  }
}
