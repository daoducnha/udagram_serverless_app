import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { getUserId } from '../lambda/utils'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {

    }

    async getAllTodos(): Promise<TodoItem[]> {
        console.log('Getting all todo items')

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]>  {
        
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'name = :name',
            ExpressionAttributeValues: {
                ':name': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }


    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async updateTodo(todoItem: TodoItem): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoItem.todoId
            }
        }).promise()

        if(result.Count === 0) {
            throw new Error(`Todo item not found with id ${todoItem.todoId}`)
        }

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem;
    }

   async deleteTodo(todoId: string) {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeNames: {
                ':todoId': todoId
            }
        }).promise()
        if(result.Count === 0) {
            throw new Error(`Todo item not found with id ${todoId}`)
        }
        const key = {
            key: todoId
        }
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: key
        }).promise()
   }
}