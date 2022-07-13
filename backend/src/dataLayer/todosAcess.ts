import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'


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

    async getTodosForUser(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
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

    async updateTodo(todoItem: TodoUpdate, userId: string, todoId: string) {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()

        if (result.Count === 0) {
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'SET #username = :username, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#username': 'name'
            },
            ExpressionAttributeValues: {
                ':username': todoItem.name,
                ':dueDate': todoItem.dueDate,
                ':done': todoItem.done
            }
        }).promise()
    }

    async deleteTodo(todoId: string, userId: string) {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
        if (result.Count === 0) {
            throw new Error(`Todo item not found with id ${todoId}`)
        }

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    buildUpdateExpression(todoItem: TodoUpdate): string {
        const updateExpression = Object.keys(todoItem).filter(
            key => todoItem[key] != null
        )
            .map(key => `${key} = :${key}`)
            .join(', ')
        console.log('updateExpression: ', updateExpression)
        return `set ${updateExpression}`
    }

    buildExpressionAttributeValues(todoItem: TodoUpdate): object {
        const expressionAttributeValues = {}

        Object.keys(todoItem).filter(
            key => todoItem[key] != null
        )
            .forEach(key => expressionAttributeValues[`:${key}`] = todoItem[key])

        console.log('expressionAttributeValues: ', expressionAttributeValues)
        return expressionAttributeValues
    }
}