import { TodosAccess } from '../dataLayer/todosAcess'

import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

// TODO: Implement businessLogic

const todosAcess = new TodosAccess()

export async function getAllTodoItems() {
    return await todosAcess.getAllTodos()
}

export async function getTodosForUser(userId: string) {
    return await todosAcess.getTodosForUser(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await todosAcess.createTodo({
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    // TODO need to update
    return await todosAcess.updateTodo({
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
    })
}

export async function deleteTodo(todoId: string, userId: string) {
    return await todosAcess.deleteTodo(todoId, userId)
}
