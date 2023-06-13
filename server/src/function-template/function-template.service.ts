import { Injectable, Logger } from '@nestjs/common'
import { CreateFunctionTemplateDto } from './dto/create-function-template.dto'
import { UseFunctionTemplateDto } from './dto/use-function-template.dto'
import { UpdateFunctionTemplateDto } from './dto/update-function-template.dto'
import { SystemDatabase } from 'src/system-database'
import {
  FunctionTemplate,
  FunctionTemplateItem,
  FunctionTemplateUseRelation,
  FunctionTemplateStarRelation,
} from './entities/function-template'
import { ObjectId } from 'mongodb'
import { EnvironmentVariableService } from 'src/application/environment.service'
import { ApplicationConfiguration } from 'src/application/entities/application-configuration'
import * as assert from 'node:assert'
import * as npa from 'npm-package-arg'
import { CloudFunction } from 'src/function/entities/cloud-function'
import { compileTs2js } from '../utils/lang'
import { CN_PUBLISHED_CONF, CN_PUBLISHED_FUNCTIONS } from 'src/constants'
import { DatabaseService } from 'src/database/database.service'
import { DependencyService } from 'src/dependency/dependency.service'
import { ApplicationService } from '../application/application.service'

@Injectable()
export class FunctionTemplateService {
  constructor(
    private readonly environmentVariableService: EnvironmentVariableService,
    private readonly databaseService: DatabaseService,
    private readonly dependencyService: DependencyService,
    private readonly appService: ApplicationService,
  ) {}

  private readonly logger = new Logger(FunctionTemplateService.name)
  private readonly db = SystemDatabase.db

  async createFunctionTemplate(
    userid: ObjectId,
    dto: CreateFunctionTemplateDto,
  ) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()

      const insertedTemplate = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .insertOne(
          {
            uid: userid,
            name: dto.name,
            dependencies: dto.dependencies.map(
              (dep) => `${dep.name}@${dep.spec}`,
            ),
            environments: dto.environments,
            private: dto.private,
            isRecommended: false,
            description: dto.description || '',
            star: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )

      const functionTemplateItems = dto.items.map((item) => ({
        templateId: insertedTemplate.insertedId,
        name: item.name,
        desc: item.description || '',
        source: { code: item.code },
        methods: item.methods,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

      await this.db
        .collection<FunctionTemplateItem>('FunctionTemplateItem')
        .insertMany(functionTemplateItems, { session })

      await session.commitTransaction()

      const pipe = [
        { $match: { _id: insertedTemplate.insertedId } },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },
      ]
      const template = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()
      return template
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  async updateFunctionTemplate(
    userid: ObjectId,
    templateId: ObjectId,
    dto: UpdateFunctionTemplateDto,
  ) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      session.startTransaction()

      const found = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .findOne({ _id: templateId, uid: userid })

      // If a template transitions from public to private, the star relationships and use relationships of other users with that template should also be removed.
      if (found.private === false && dto.private === true) {
        await this.db
          .collection<FunctionTemplateStarRelation>(
            'FunctionTemplateStarRelation',
          )
          .deleteMany(
            { templateId: templateId, uid: { $ne: userid } },
            { session },
          )
        await this.db
          .collection<FunctionTemplateUseRelation>(
            'FunctionTemplateUseRelation',
          )
          .deleteMany(
            { templateId: templateId, uid: { $ne: userid } },
            { session },
          )
        const star = await this.db
          .collection<FunctionTemplateStarRelation>(
            'FunctionTemplateStarRelation',
          )
          .findOne({ uid: userid, templateId: templateId }, { session })
        if (star) {
          await this.db
            .collection<FunctionTemplate>('FunctionTemplate')
            .updateOne(
              { _id: templateId, uid: userid },
              { $set: { star: 1 } },
              { session },
            )
        } else {
          await this.db
            .collection<FunctionTemplate>('FunctionTemplate')
            .updateOne(
              { _id: templateId, uid: userid },
              { $set: { star: 0 } },
              { session },
            )
        }
      }

      const res = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .findOneAndUpdate(
          { _id: templateId, uid: userid },
          {
            $set: {
              name: dto.name,
              dependencies: dto.dependencies.map(
                (dep) => `${dep.name}@${dep.spec}`,
              ),
              environments: dto.environments,
              private: dto.private,
              isRecommended: false,
              description: dto.description || '',
            },
            $currentDate: { updatedAt: true },
          },
          {
            session: session,
            returnDocument: 'after',
          },
        )
      if (res.lastErrorObject.updatedExisting) {
        const functionTemplateItems = dto.items.map((item) => ({
          templateId: res.value._id,
          name: item.name,
          desc: item.description || '',
          source: { code: item.code },
          methods: item.methods,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        await this.db
          .collection<FunctionTemplateItem>('FunctionTemplateItem')
          .deleteMany({ templateId: templateId }, { session })
        await this.db
          .collection<FunctionTemplateItem>('FunctionTemplateItem')
          .insertMany(functionTemplateItems, { session })
      }
      await session.commitTransaction()

      const pipe = [
        { $match: { _id: templateId } },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },
      ]
      const template = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()
      return template
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  // use function template
  async useFunctionTemplate(
    userid: ObjectId,
    appid: string,
    dto: UseFunctionTemplateDto,
  ) {
    const client = SystemDatabase.client
    const appDataBaseInfo = await this.databaseService.findOne(appid)
    const appDataBase = client.db(appDataBaseInfo.name)

    const session = client.startSession()

    try {
      session.startTransaction()

      const functionTemplate = await this.findOneFunctionTemplate(
        dto.functionTemplateId,
      )
      assert(
        functionTemplate.private === false ||
          functionTemplate.uid.toString() === userid.toString(),
        'private function template can only be used by the owner',
      )
      // add function template dependencies to application configuration
      //
      const extraDependencies = await this.dependencyService.getExtras(appid)
      const builtinDependencies = this.dependencyService.getBuiltins()
      const all = extraDependencies.concat(builtinDependencies)
      const allNames = all.map((item) => npa(item).name)

      // If the dependency already exists, use the original dependency.
      const filtered = functionTemplate.dependencies.filter((item) => {
        const name = npa(item).name
        return !allNames.includes(name)
      })
      const deps = extraDependencies.concat(filtered)

      await this.db
        .collection<ApplicationConfiguration>('ApplicationConfiguration')
        .updateOne(
          { appid },
          {
            $set: { dependencies: deps },
            $currentDate: { updatedAt: true },
          },
          { session },
        )

      // add function template Env to application configuration
      //
      const originEnv = await this.environmentVariableService.findAll(appid)
      const mergedEnv = [
        ...originEnv,
        ...functionTemplate.environments.filter(
          (item2) => !originEnv.some((item1) => item1.name === item2.name),
        ),
      ]

      const applicationConf = await this.db
        .collection<ApplicationConfiguration>('ApplicationConfiguration')
        .findOneAndUpdate(
          { appid },
          {
            $set: { environments: mergedEnv },
            $currentDate: { updatedAt: true },
          },
          { returnDocument: 'after', session },
        )
      assert(applicationConf?.value, 'application configuration not found')

      // publish application configuration to app database
      const coll = appDataBase.collection(CN_PUBLISHED_CONF)
      await coll.deleteOne({ appid: applicationConf.value.appid }, { session })
      await coll.insertOne(applicationConf.value, { session })

      // publish function template items to CloudFunction and app database
      //
      const functionTemplateItems = await this.findFunctionTemplateItems(
        dto.functionTemplateId,
      )

      for (const functionTemplateItem of functionTemplateItems) {
        await this.db.collection<CloudFunction>('CloudFunction').insertOne(
          {
            appid,
            name: functionTemplateItem.name,
            source: {
              code: functionTemplateItem.source.code,
              compiled: compileTs2js(functionTemplateItem.source.code),
              version: 0,
            },
            desc: functionTemplateItem.desc || '',
            createdBy: userid,
            methods: functionTemplateItem.methods,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )
      }

      // add function template items to app database
      for (const functionTemplateItem of functionTemplateItems) {
        const fn = await this.db
          .collection<CloudFunction>('CloudFunction')
          .findOne(
            { appid: appid, name: functionTemplateItem.name },
            { session },
          )

        const coll = appDataBase.collection(CN_PUBLISHED_FUNCTIONS)
        await coll.deleteOne({ name: fn.name }, { session })
        await coll.insertOne(fn, { session })
      }

      // user use relation
      const res = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .findOneAndUpdate(
          { uid: userid, templateId: dto.functionTemplateId },
          {
            $currentDate: { updatedAt: true },
          },
          { session },
        )
      if (!res.lastErrorObject.updatedExisting) {
        await this.db
          .collection<FunctionTemplateUseRelation>(
            'FunctionTemplateUseRelation',
          )
          .insertOne(
            {
              uid: userid,
              templateId: dto.functionTemplateId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { session },
          )
      }

      await session.commitTransaction()

      const pipe = [
        { $match: { _id: dto.functionTemplateId } },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },
      ]
      const result = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()
      return result
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  async deleteFunctionTemplate(templateId: ObjectId, userid: ObjectId) {
    const client = SystemDatabase.client
    const session = client.startSession()
    try {
      session.startTransaction()

      const pipe = [
        { $match: { _id: templateId } },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },
      ]

      const deletedFunctionTemplate = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()

      await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .deleteOne({ _id: templateId, uid: userid }, { session })
      await this.db
        .collection<FunctionTemplateItem>('FunctionTemplateItem')
        .deleteMany({ templateId: templateId }, { session })

      await session.commitTransaction()

      return deletedFunctionTemplate
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
  async starFunctionTemplate(templateId: ObjectId, userid: ObjectId) {
    const client = SystemDatabase.client
    const session = client.startSession()
    try {
      session.startTransaction()
      const functionTemplate = await this.findOneFunctionTemplate(templateId)
      assert(
        functionTemplate.private === false ||
          functionTemplate.uid.toString() === userid.toString(),
        'private function template can only be stared by the owner',
      )

      const found = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .findOne({ uid: userid, templateId: templateId })

      if (found) {
        await this.db
          .collection<FunctionTemplate>('FunctionTemplate')
          .updateOne(
            { _id: templateId },
            { $inc: { star: -1 }, $currentDate: { updatedAt: true } },
            { session },
          )
        await this.db
          .collection<FunctionTemplateStarRelation>(
            'FunctionTemplateStarRelation',
          )
          .deleteOne({ uid: userid, templateId: templateId }, { session })
        await session.commitTransaction()
        return 'unstar'
      }

      await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .updateOne(
          { _id: templateId },
          { $inc: { star: 1 }, $currentDate: { updatedAt: true } },
          { session },
        )

      await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .insertOne(
          {
            uid: userid,
            templateId: templateId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )

      await session.commitTransaction()
      return 'stared'
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession
    }
  }

  async functionTemplateUserStarState(templateId: ObjectId, userid: ObjectId) {
    const res = await this.db
      .collection<FunctionTemplateStarRelation>('FunctionTemplateStarRelation')
      .findOne({ uid: userid, templateId: templateId })
    if (res) {
      return 'stared'
    } else {
      return 'unstar'
    }
  }

  async functionTemplateUsedBy(
    templateId: ObjectId,
    recent: number,
    page: number,
    pageSize: number,
  ) {
    const pipe = [
      { $match: { templateId: templateId } },
      {
        $lookup: {
          from: 'User',
          localField: 'uid',
          foreignField: '_id',
          as: 'users',
        },
      },
      { $sort: { updatedAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]
    const usedBy = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .aggregate(pipe)
      .toArray()

    const total = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .countDocuments({ templateId })

    const res = {
      list: usedBy,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findOne(templateId: ObjectId) {
    const pipe = [
      { $match: { _id: templateId } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
    ]
    const functionTemplate = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .toArray()

    return functionTemplate
  }

  async findFunctionTemplates(recent: number, page: number, pageSize: number) {
    const pipe = [
      { $match: { private: false } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { createdAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ private: false })

    const functionTemplate = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: functionTemplate,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMostStarFunctionTemplates(
    starAsc: number,
    page: number,
    pageSize: number,
  ) {
    const pipe = [
      { $match: { private: false } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      {
        $sort: {
          star: starAsc === 0 ? 1 : -1,
        },
      },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ private: false })

    const templates = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: templates,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findFunctionTemplatesByName(
    recent: number,
    page: number,
    pageSize: number,
    name: string,
  ) {
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const reg = new RegExp(safeName, 'i')
    const pipe = [
      { $match: { private: false, name: { $regex: reg } } },

      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { createdAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments(
        { private: false, name: { $regex: reg } },
        { maxTimeMS: 5000 },
      )

    const functionTemplate = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .maxTimeMS(5000)
      .toArray()

    const res = {
      list: functionTemplate,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyMostStarFunctionTemplates(
    starAsc: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
  ) {
    const pipe = [
      { $match: { private: false, uid: userid } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      {
        $sort: {
          star: starAsc === 0 ? 1 : -1,
        },
      },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ private: false, uid: userid })

    const templates = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: templates,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyFunctionTemplatesByName(
    recent: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
    name: string,
  ) {
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const reg = new RegExp(safeName, 'i')
    const pipe = [
      { $match: { uid: userid, name: { $regex: reg } } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { createdAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments(
        { uid: userid, name: { $regex: reg } },
        { maxTimeMS: 5000 },
      )

    const myTemplate = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .maxTimeMS(5000)
      .toArray()

    const res = {
      list: myTemplate,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyFunctionTemplates(
    recent: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
  ) {
    const pipe = [
      { $match: { uid: userid } },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { createdAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ uid: userid })

    const myTemplate = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: myTemplate,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyStaredFunctionTemplates(
    recent: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
    name?: string,
  ) {
    if (name) {
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(safeName, 'i')

      const pipe = [
        {
          $lookup: {
            from: 'FunctionTemplate',
            localField: 'templateId',
            foreignField: '_id',
            as: 'functionTemplate',
          },
        },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: 'templateId',
            foreignField: 'templateId',
            as: 'items',
          },
        },
        { $match: { uid: userid, 'functionTemplate.name': { $regex: reg } } },
        { $sort: { createdAt: recent === 0 ? 1 : -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const pipe2 = [
        {
          $lookup: {
            from: 'FunctionTemplate',
            localField: 'templateId',
            foreignField: '_id',
            as: 'functionTemplate',
          },
        },
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: 'templateId',
            foreignField: 'templateId',
            as: 'items',
          },
        },
        { $match: { uid: userid, 'functionTemplate.name': { $regex: reg } } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]

      const total = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .aggregate(pipe2)
        .maxTimeMS(5000)
        .toArray()

      const myStarTemplates = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .aggregate(pipe)
        .maxTimeMS(5000)
        .toArray()

      const transformedData = myStarTemplates.map((element) => {
        const { functionTemplate, items } = element
        const [template] = functionTemplate
        const result = { ...template }
        result.items = items
        return result
      })

      const res = {
        list: transformedData,
        total: total[0] ? total[0].count : 0,
        page,
        pageSize,
      }

      return res
    }

    const pipe = [
      { $match: { uid: userid } },
      {
        $lookup: {
          from: 'FunctionTemplate',
          localField: 'templateId',
          foreignField: '_id',
          as: 'functionTemplate',
        },
      },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: 'templateId',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { createdAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplateStarRelation>('FunctionTemplateStarRelation')
      .countDocuments({ uid: userid })

    const myStarTemplates = await this.db
      .collection<FunctionTemplateStarRelation>('FunctionTemplateStarRelation')
      .aggregate(pipe)
      .toArray()

    const transformedData = myStarTemplates.map((element) => {
      const { functionTemplate, items } = element
      const [template] = functionTemplate
      const result = { ...template }
      result.items = items
      return result
    })

    const res = {
      list: transformedData,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyRecentUseFunctionTemplates(
    recent: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
  ) {
    const pipe = [
      { $match: { uid: userid } },
      {
        $lookup: {
          from: 'FunctionTemplate',
          localField: 'templateId',
          foreignField: '_id',
          as: 'functionTemplate',
        },
      },
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: 'templateId',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      { $sort: { updatedAt: recent === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const recentUseFunctionTemplates = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .aggregate(pipe)
      .toArray()

    const total = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .countDocuments({ uid: userid })

    const transformedData = recentUseFunctionTemplates.map((element) => {
      const { functionTemplate, items } = element
      const [template] = functionTemplate
      const result = { ...template }
      result.items = items
      return result
    })

    const res = {
      list: transformedData,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findOneFunctionTemplate(templateId: ObjectId, userid?: ObjectId) {
    if (userid) {
      // 查找一个 function template
      const res = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .findOne({ _id: templateId, uid: userid })
      return res
    }

    const res = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .findOne({ _id: templateId })
    return res
  }

  async findFunctionTemplateItems(templateId: ObjectId) {
    const functionTemplateItems = await this.db
      .collection<FunctionTemplateItem>('FunctionTemplateItem')
      .find({ templateId: templateId })
      .toArray()

    return functionTemplateItems
  }

  async applicationAuthGuard(appid, userid) {
    const app = await this.appService.findOne(appid)
    if (!app) {
      return false
    }

    const author_id = app.createdBy?.toString()
    if (author_id !== userid.toString()) {
      return false
    }

    return true
  }
}
