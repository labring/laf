import { Injectable, Logger } from '@nestjs/common'
import { CreateFunctionTemplateDto } from './dto/create-function-template.dto'
import { UpdateFunctionTemplateDto } from './dto/update-function-template.dto'
import { SystemDatabase } from 'src/system-database'
import {
  FunctionTemplate,
  FunctionTemplateItem,
  FunctionTemplateUseRelation,
  FunctionTemplateStarRelation,
  RelationState,
} from './entities/function-template'
import { ObjectId } from 'mongodb'
import { EnvironmentVariableService } from 'src/application/environment.service'
import { ApplicationConfiguration } from 'src/application/entities/application-configuration'
import * as assert from 'node:assert'
import * as npa from 'npm-package-arg'
import { CloudFunction } from 'src/function/entities/cloud-function'
import { compileTs2js } from '../utils/lang'
import { DatabaseService } from 'src/database/database.service'
import { DependencyService } from 'src/dependency/dependency.service'
import { ApplicationService } from '../application/application.service'
import { ApplicationConfigurationService } from 'src/application/configuration.service'
import { FunctionService } from 'src/function/function.service'
import { User } from 'src/user/entities/user'

interface FindFunctionTemplatesParams {
  asc: number
  page: number
  pageSize: number
  name?: string
  hot?: boolean
}

@Injectable()
export class FunctionTemplateService {
  constructor(
    private readonly environmentVariableService: EnvironmentVariableService,
    private readonly databaseService: DatabaseService,
    private readonly dependencyService: DependencyService,
    private readonly appService: ApplicationService,
    private readonly confService: ApplicationConfigurationService,
    private readonly functionsService: FunctionService,
  ) {}

  private readonly logger = new Logger(FunctionTemplateService.name)
  private readonly db = SystemDatabase.db
  private readonly maskedString = 'xxxxxxxxxxxxxxxxxxxx'

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
          .updateMany(
            { templateId: templateId, uid: { $ne: userid } },
            {
              $set: { state: RelationState.Disabled },
              $currentDate: { updatedAt: true },
            },
            { session },
          )
        await this.db
          .collection<FunctionTemplateUseRelation>(
            'FunctionTemplateUseRelation',
          )
          .updateMany(
            { templateId: templateId, uid: { $ne: userid } },
            {
              $set: { state: RelationState.Disabled },
              $currentDate: { updatedAt: true },
            },
            { session },
          )
      }
      // If a template becomes public, restart the usage and collection relationship for that template
      if (found.private === true && dto.private === false) {
        await this.db
          .collection<FunctionTemplateStarRelation>(
            'FunctionTemplateStarRelation',
          )
          .updateMany(
            { templateId: templateId, uid: { $ne: userid } },
            {
              $set: { state: RelationState.Enabled },
              $currentDate: { updatedAt: true },
            },
            { session },
          )
        await this.db
          .collection<FunctionTemplateUseRelation>(
            'FunctionTemplateUseRelation',
          )
          .updateMany(
            { templateId: templateId, uid: { $ne: userid } },
            {
              $set: { state: RelationState.Enabled },
              $currentDate: { updatedAt: true },
            },
            { session },
          )
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

  // use a function template
  async useFunctionTemplate(
    userid: ObjectId,
    appid: string,
    templateId: ObjectId,
  ) {
    const client = SystemDatabase.client

    const session = client.startSession()

    try {
      session.startTransaction()

      const functionTemplate = await this.findOneFunctionTemplate(templateId)

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
      await this.confService.publish(applicationConf.value)

      // publish function template items to CloudFunction and app database
      //
      const functionTemplateItems = await this.findFunctionTemplateItems(
        templateId,
      )

      const existingNames = new Set(
        await this.db
          .collection<CloudFunction>('CloudFunction')
          .aggregate([
            { $match: { appid: appid } },
            { $group: { _id: null, names: { $addToSet: '$name' } } },
          ])
          .toArray()
          .then((result) => (result.length > 0 ? result[0].names : [])),
      )

      const documents = []

      for (const functionTemplateItem of functionTemplateItems) {
        // Check name is unique
        while (existingNames.has(functionTemplateItem.name)) {
          functionTemplateItem.name = `${functionTemplateItem.name}-copy`
        }

        // Add the unique name to the set
        existingNames.add(functionTemplateItem.name)

        const document = {
          appid,
          name: functionTemplateItem.name,
          source: {
            code: functionTemplateItem.source.code,
            compiled: compileTs2js(
              functionTemplateItem.source.code,
              functionTemplateItem.name,
            ),
            version: 0,
          },
          desc: functionTemplateItem.desc || '',
          createdBy: userid,
          methods: functionTemplateItem.methods,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        documents.push(document)
      }

      await this.db
        .collection<CloudFunction>('CloudFunction')
        .insertMany(documents, { session })

      // publish function template items to app database
      const namesToSearch = functionTemplateItems.map((item) => item.name)
      const itemsToInsert = await this.db
        .collection<CloudFunction>('CloudFunction')
        .find({ appid: appid, name: { $in: namesToSearch } }, { session })
        .toArray()

      await this.functionsService.publishFunctionTemplateItems(itemsToInsert)

      // add user use relation
      //
      const res = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .findOneAndUpdate(
          { uid: userid, templateId: templateId },
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
              templateId: templateId,
              state: RelationState.Enabled,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            { session },
          )
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

      // remove use relation and star relation
      await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .deleteMany({ templateId: templateId }, { session })

      await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
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
          .updateOne({ _id: templateId }, { $inc: { star: -1 } }, { session })

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
        .updateOne({ _id: templateId }, { $inc: { star: 1 } }, { session })

      await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .insertOne(
          {
            uid: userid,
            templateId: templateId,
            state: RelationState.Enabled,
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
    asc: number,
    page: number,
    pageSize: number,
  ) {
    const pipe = [
      { $match: { templateId: templateId } },
      { $project: { uid: 1, _id: 0 } },
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
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

    const user = await this.db.collection<User>('User').findOne({
      _id: functionTemplate[0].uid,
    })

    if (user.phone && user.username) {
      if (user.phone == user.username) {
        user.username =
          user.username.slice(0, 3) +
          'x'.repeat(user.username.length - 6) +
          user.username.slice(-3)
      }
    }

    functionTemplate[0]['user'] = {
      username: user?.username,
      email: user?.email,
    }

    return functionTemplate
  }

  // get all public function templates
  async findFunctionTemplates(
    asc: number,
    page: number,
    pageSize: number,
    userid: ObjectId,
    sort?: string,
  ) {
    const pipe: any[] = [
      { $match: { private: false } },
      {
        $lookup: {
          from: 'User',
          localField: 'uid',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      this.fieldForUserStarRelation('$_id', userid),
      {
        $addFields: {
          stared: {
            $cond: [{ $gt: [{ $size: '$starRelation' }, 0] }, true, false],
          },
        },
      },
      { $project: { user: 0, starRelation: 0 } },
    ]
    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ private: false })

    if (sort === 'hot') {
      pipe.push(
        {
          $sort: {
            star: asc === 0 ? 1 : -1,
            _id: 1,
          },
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      )

      const functionTemplates = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()

      const res = {
        list: functionTemplates,
        total: total,
        page,
        pageSize,
      }

      return res
    }

    if (sort === 'recommend') {
      pipe.push(
        {
          $sort: {
            isRecommended: -1,
            star: asc === 0 ? 1 : -1,
          },
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      )

      const functionTemplates = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .toArray()

      const res = {
        list: functionTemplates,
        total: total,
        page,
        pageSize,
      }

      return res
    }

    pipe.push(
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    )

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

  async findFunctionTemplatesByName(
    asc: number,
    page: number,
    pageSize: number,
    name: string,
    userid: ObjectId,
  ) {
    const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const reg = new RegExp(safeName, 'i')

    const pipe = [
      { $match: { private: false } },
      {
        $lookup: {
          from: 'User',
          localField: 'uid',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: '$items',
                as: 'item',
                cond: { $regexMatch: { input: '$$item.name', regex: reg } },
              },
            },
          },
        },
      },
      this.fieldForUserStarRelation('$_id', userid),
      {
        $addFields: {
          stared: {
            $cond: [{ $gt: [{ $size: '$starRelation' }, 0] }, true, false],
          },
        },
      },
      {
        $match: {
          $or: [
            { name: { $regex: reg } },
            { description: { $regex: reg } },
            { matchCount: { $gt: 0 } },
          ],
        },
      },

      { $project: { user: 0, starRelation: 0, matchCount: 0 } },
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const pipeForTotal = [
      {
        $lookup: {
          from: 'FunctionTemplateItem',
          localField: '_id',
          foreignField: 'templateId',
          as: 'items',
        },
      },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: '$items',
                as: 'item',
                cond: { $regexMatch: { input: '$$item.name', regex: reg } },
              },
            },
          },
        },
      },
      {
        $match: {
          private: false,
          $or: [
            { name: { $regex: reg } },
            { description: { $regex: reg } },
            { matchCount: { $gt: 0 } },
          ],
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipeForTotal)
      .maxTimeMS(5000)
      .toArray()

    const functionTemplates = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .aggregate(pipe)
      .maxTimeMS(5000)
      .toArray()

    const res = {
      list: functionTemplates,
      total: total[0] ? total[0].count : 0,
      page,
      pageSize,
    }

    return res
  }

  // get all recommend function templates
  async findRecommendFunctionTemplates(
    userid: ObjectId,
    condition: FindFunctionTemplatesParams,
  ) {
    const { asc, page, pageSize, name, hot } = condition
    let pipe: any[] = [
      { $match: { private: false, isRecommended: true } },
      this.generateLookup('User', 'uid', '_id', 'user'),
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      this.generateLookup('FunctionTemplateItem', '_id', 'templateId', 'items'),
      this.fieldForUserStarRelation('$_id', userid),
      {
        $addFields: {
          stared: {
            $cond: [{ $gt: [{ $size: '$starRelation' }, 0] }, true, false],
          },
        },
      },
    ]

    if (name) {
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(safeName, 'i')

      pipe = [
        ...pipe,
        {
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $regexMatch: { input: '$$item.name', regex: reg } },
                },
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: reg } },
              { description: { $regex: reg } },
              { matchCount: { $gt: 0 } },
            ],
          },
        },
        { $project: { user: 0, starRelation: 0, matchCount: 0 } },
        { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const pipeForTotal = [
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },

        {
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $regexMatch: { input: '$$item.name', regex: reg } },
                },
              },
            },
          },
        },

        {
          $match: {
            private: false,
            isRecommended: true,
            $or: [
              { name: { $regex: reg } },
              { description: { $regex: reg } },
              { matchCount: { $gt: 0 } },
            ],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]

      const total = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipeForTotal)
        .maxTimeMS(5000)
        .toArray()

      const functionTemplate = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .maxTimeMS(5000)
        .toArray()

      const res = {
        list: functionTemplate,
        total: total[0] ? total[0].count : 0,
        page,
        pageSize,
      }

      return res
    }

    if (hot) {
      pipe = [
        ...pipe,
        { $project: { user: 0, starRelation: 0 } },
        {
          $sort: {
            star: asc === 0 ? 1 : -1,
          },
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const total = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .countDocuments({ private: false, isRecommended: true })

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

    pipe = [
      ...pipe,
      { $project: { user: 0, starRelation: 0 } },
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ private: false, isRecommended: true })

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

  async findMyFunctionTemplates(
    userid: ObjectId,
    condition: FindFunctionTemplatesParams,
  ) {
    const { asc, page, pageSize, name, hot } = condition
    let pipe: any[] = [
      { $match: { uid: userid } },
      this.generateLookup('User', 'uid', '_id', 'user'),
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      this.generateLookup('FunctionTemplateItem', '_id', 'templateId', 'items'),
      this.fieldForUserStarRelation('$_id', userid),
      {
        $addFields: {
          stared: {
            $cond: [{ $gt: [{ $size: '$starRelation' }, 0] }, true, false],
          },
        },
      },
    ]

    if (name) {
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(safeName, 'i')
      pipe = [
        ...pipe,
        {
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $regexMatch: { input: '$$item.name', regex: reg } },
                },
              },
            },
          },
        },
        {
          $match: {
            $or: [
              { name: { $regex: reg } },
              { description: { $regex: reg } },
              { matchCount: { $gt: 0 } },
            ],
          },
        },

        { $project: { user: 0, starRelation: 0, matchCount: 0 } },
        { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]
      const pipeForTotal = [
        {
          $lookup: {
            from: 'FunctionTemplateItem',
            localField: '_id',
            foreignField: 'templateId',
            as: 'items',
          },
        },

        {
          $addFields: {
            matchCount: {
              $size: {
                $filter: {
                  input: '$items',
                  as: 'item',
                  cond: { $regexMatch: { input: '$$item.name', regex: reg } },
                },
              },
            },
          },
        },

        {
          $match: {
            uid: userid,
            $or: [
              { name: { $regex: reg } },
              { description: { $regex: reg } },
              { matchCount: { $gt: 0 } },
            ],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]

      const total = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipeForTotal)
        .maxTimeMS(5000)
        .toArray()

      const myTemplate = await this.db
        .collection<FunctionTemplate>('FunctionTemplate')
        .aggregate(pipe)
        .maxTimeMS(5000)
        .toArray()

      const res = {
        list: myTemplate,
        total: total[0] ? total[0].count : 0,
        page,
        pageSize,
      }

      return res
    }

    if (hot) {
      pipe = [
        ...pipe,
        { $project: { user: 0, starRelation: 0 } },
        {
          $sort: {
            star: asc === 0 ? 1 : -1,
            _id: 1,
          },
        },
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

    pipe = [
      ...pipe,
      { $project: { user: 0, starRelation: 0 } },
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
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
    userid: ObjectId,
    condition: FindFunctionTemplatesParams,
  ) {
    const { asc, page, pageSize, name, hot } = condition
    let pipe: any[] = [
      this.generateLookup(
        'FunctionTemplate',
        'templateId',
        '_id',
        'functionTemplate',
      ),
      { $unwind: '$functionTemplate' },
      this.generateLookup(
        'FunctionTemplateItem',
        'templateId',
        'templateId',
        'items',
      ),
      this.generateLookup('User', 'functionTemplate.uid', '_id', 'user'),
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      this.fieldForUserStarRelation('$functionTemplate._id', userid),
    ]
    if (name) {
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(safeName, 'i')

      pipe = [
        {
          $match: {
            uid: userid,
            state: RelationState.Enabled,
          },
        },
        ...pipe,
        {
          $match: {
            $or: [
              { 'functionTemplate.name': { $regex: reg } },
              { 'functionTemplate.description': { $regex: reg } },
              { 'items.name': { $regex: reg } },
            ],
          },
        },
        this.projectFields(),

        { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const pipeForTotal = [
        this.generateLookup(
          'FunctionTemplate',
          'templateId',
          '_id',
          'functionTemplate',
        ),
        this.generateLookup(
          'FunctionTemplateItem',
          'templateId',
          'templateId',
          'items',
        ),
        {
          $match: {
            uid: userid,
            state: RelationState.Enabled,
            $or: [
              { 'functionTemplate.name': { $regex: reg } },
              { 'functionTemplate.description': { $regex: reg } },
              { 'items.name': { $regex: reg } },
            ],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]

      const total = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .aggregate(pipeForTotal)
        .maxTimeMS(5000)
        .toArray()

      const myStarTemplates = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .aggregate(pipe)
        .maxTimeMS(5000)
        .toArray()

      const res = {
        list: myStarTemplates,
        total: total[0] ? total[0].count : 0,
        page,
        pageSize,
      }
      return res
    }

    if (hot) {
      pipe = [
        { $match: { uid: userid, state: RelationState.Enabled } },
        ...pipe,
        this.projectFields(),
        {
          $sort: {
            star: asc === 0 ? 1 : -1,
            _id: 1,
          },
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const total = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .countDocuments({ uid: userid, state: RelationState.Enabled })

      const myStarTemplates = await this.db
        .collection<FunctionTemplateStarRelation>(
          'FunctionTemplateStarRelation',
        )
        .aggregate(pipe)
        .toArray()

      const res = {
        list: myStarTemplates,
        total: total,
        page,
        pageSize,
      }

      return res
    }

    pipe = [
      { $match: { uid: userid, state: RelationState.Enabled } },
      ...pipe,
      this.projectFields(),
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<FunctionTemplateStarRelation>('FunctionTemplateStarRelation')
      .countDocuments({ uid: userid, state: RelationState.Enabled })

    const myStarTemplates = await this.db
      .collection<FunctionTemplateStarRelation>('FunctionTemplateStarRelation')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: myStarTemplates,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findMyRecentUseFunctionTemplates(
    userid: ObjectId,
    condition: FindFunctionTemplatesParams,
  ) {
    const { asc, page, pageSize, name, hot } = condition
    let pipe: any[] = [
      this.generateLookup(
        'FunctionTemplate',
        'templateId',
        '_id',
        'functionTemplate',
      ),
      { $unwind: '$functionTemplate' },
      this.generateLookup(
        'FunctionTemplateItem',
        'templateId',
        'templateId',
        'items',
      ),
      this.generateLookup('User', 'functionTemplate.uid', '_id', 'user'),
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      this.fieldsForAuthorInfo(),
      this.fieldForUserStarRelation('$functionTemplate._id', userid),
    ]

    if (name) {
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const reg = new RegExp(safeName, 'i')
      pipe = [
        {
          $match: {
            uid: userid,
            state: RelationState.Enabled,
          },
        },
        ...pipe,
        {
          $match: {
            $or: [
              { 'functionTemplate.name': { $regex: reg } },
              { 'functionTemplate.description': { $regex: reg } },
              { 'items.name': { $regex: reg } },
            ],
          },
        },
        this.projectFields(),
        { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const pipeForTotal = [
        this.generateLookup(
          'FunctionTemplate',
          'templateId',
          '_id',
          'functionTemplate',
        ),
        this.generateLookup(
          'FunctionTemplateItem',
          'templateId',
          'templateId',
          'items',
        ),
        {
          $match: {
            uid: userid,
            state: RelationState.Enabled,
            $or: [
              { 'functionTemplate.name': { $regex: reg } },
              { 'functionTemplate.description': { $regex: reg } },
              { 'items.name': { $regex: reg } },
            ],
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]

      const total = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .aggregate(pipeForTotal)
        .maxTimeMS(5000)
        .toArray()

      const myStarTemplates = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .aggregate(pipe)
        .maxTimeMS(5000)
        .toArray()

      const res = {
        list: myStarTemplates,
        total: total[0] ? total[0].count : 0,
        page,
        pageSize,
      }

      return res
    }

    if (hot) {
      pipe = [
        { $match: { uid: userid, state: RelationState.Enabled } },
        ...pipe,
        this.projectFields(),
        {
          $sort: {
            'functionTemplate.star': asc === 0 ? 1 : -1,
            'functionTemplate._id': 1,
          },
        },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ]

      const recentUseFunctionTemplates = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .aggregate(pipe)
        .toArray()

      const total = await this.db
        .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
        .countDocuments({ uid: userid, state: RelationState.Enabled })

      const res = {
        list: recentUseFunctionTemplates,
        total: total,
        page,
        pageSize,
      }

      return res
    }

    pipe = [
      { $match: { uid: userid, state: RelationState.Enabled } },
      ...pipe,
      this.projectFields(),
      { $sort: { updatedAt: asc === 0 ? 1 : -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const recentUseFunctionTemplates = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .aggregate(pipe)
      .toArray()

    const total = await this.db
      .collection<FunctionTemplateUseRelation>('FunctionTemplateUseRelation')
      .countDocuments({ uid: userid, state: RelationState.Enabled })

    const res = {
      list: recentUseFunctionTemplates,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findOneFunctionTemplate(templateId: ObjectId, userid?: ObjectId) {
    if (userid) {
      // find one function template
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

  // get items of a function template
  async findFunctionTemplateItems(templateId: ObjectId) {
    const functionTemplateItems = await this.db
      .collection<FunctionTemplateItem>('FunctionTemplateItem')
      .find({ templateId: templateId })
      .toArray()

    return functionTemplateItems
  }

  async getCountOfFunctionTemplates(uid: ObjectId) {
    const count = await this.db
      .collection<FunctionTemplate>('FunctionTemplate')
      .countDocuments({ uid: uid })

    return count
  }

  // Verify the relationship between the user and the appid
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

  generateLookup(
    fromCollection: string,
    localField: string,
    foreignField: string,
    alias: string,
  ) {
    return {
      $lookup: {
        from: fromCollection,
        localField: localField,
        foreignField: foreignField,
        as: alias,
      },
    }
  }

  projectFields() {
    return {
      $project: {
        _id: '$functionTemplate._id',
        uid: '$functionTemplate.uid',
        name: '$functionTemplate.name',
        dependencies: '$functionTemplate.dependencies',
        environments: '$functionTemplate.environments',
        private: '$functionTemplate.private',
        isRecommended: '$functionTemplate.isRecommended',
        description: '$functionTemplate.description',
        star: '$functionTemplate.star',
        createdAt: '$functionTemplate.createdAt',
        updatedAt: '$functionTemplate.updatedAt',
        items: 1,
        author: '$author',
        stared: {
          $cond: [{ $gt: [{ $size: '$starRelation' }, 0] }, true, false],
        },
      },
    }
  }

  fieldsForAuthorInfo() {
    return {
      $addFields: {
        author: {
          $cond: [
            {
              $and: [
                { $eq: ['$user.username', '$user.phone'] },
                { $ne: ['$user.username', null] },
                { $ne: ['$user.phone', null] },
              ],
            },
            {
              $concat: [
                { $substrCP: ['$user.username', 0, 3] },
                {
                  $substrCP: [
                    this.maskedString,
                    0,
                    { $subtract: [{ $strLenCP: '$user.username' }, 6] },
                  ],
                },
                {
                  $substrCP: [
                    '$user.username',
                    { $subtract: [{ $strLenCP: '$user.username' }, 3] },
                    3,
                  ],
                },
              ],
            },
            '$user.username',
          ],
        },
      },
    }
  }

  fieldForUserStarRelation(functionTemplateId: string, userid: ObjectId) {
    return {
      $lookup: {
        from: 'FunctionTemplateStarRelation',
        let: { templateId: functionTemplateId, userId: userid },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$templateId', '$$templateId'] },
                  { $eq: ['$uid', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'starRelation',
      },
    }
  }
}
